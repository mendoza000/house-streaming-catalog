import { type NextRequest, NextResponse } from "next/server"
import { fulfillOrder } from "@/api/fulfillment"
import { completeOrderWithReference, getOrderAdmin } from "@/api/orders-admin"
import { expectedUsdAmount } from "@/lib/paypal/amount"

const PAYPAL_API_BASE =
	process.env.NODE_ENV === "production"
		? "https://api-m.paypal.com"
		: "https://api-m.sandbox.paypal.com"

/** Tolerancia al comparar el monto capturado vs el esperado (centavos). */
const AMOUNT_TOLERANCE_USD = 0.01

async function getAccessToken(): Promise<string> {
	const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
	const clientSecret = process.env.PAYPAL_CLIENT_SECRET

	if (!clientId || !clientSecret) {
		throw new Error("PayPal credentials not configured")
	}

	const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

	const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${auth}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "grant_type=client_credentials",
	})

	if (!response.ok) {
		throw new Error("Failed to get PayPal access token")
	}

	const data = await response.json()
	return data.access_token
}

/** Extrae el primer capture (id + monto) del payload de captura de PayPal. */
function extractCapture(
	captureData: unknown,
): { id: string; value: number; currency: string } | null {
	const unit = (captureData as { purchase_units?: unknown[] })
		?.purchase_units?.[0] as
		| { payments?: { captures?: unknown[] } }
		| undefined
	const capture = unit?.payments?.captures?.[0] as
		| { id?: string; amount?: { value?: string; currency_code?: string } }
		| undefined

	if (!capture?.id || !capture.amount?.value) return null

	return {
		id: capture.id,
		value: Number(capture.amount.value),
		currency: capture.amount.currency_code ?? "USD",
	}
}

/**
 * POST /api/paypal/capture-order
 * Body: { paypalOrderId: string, orderId: number }
 *
 * Captura el pago en PayPal y, server-side (service-role), marca NUESTRA orden
 * `completed` y entrega la cuenta. Espeja el patrón de Binance: toda la escritura
 * a DB y la entrega ocurren acá, nunca desde el cliente anon (que la RLS bloquea).
 * Verifica que el monto capturado coincida con la orden antes de completar.
 */
export async function POST(request: NextRequest) {
	try {
		const { paypalOrderId, orderId } = await request.json()

		if (!paypalOrderId || typeof paypalOrderId !== "string") {
			return NextResponse.json(
				{ error: "Invalid PayPal order ID" },
				{ status: 400 },
			)
		}
		if (typeof orderId !== "number" || !Number.isInteger(orderId)) {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
		}

		// 1. Leer la orden (service-role, bypassa RLS)
		const { data: order, error: orderError } = await getOrderAdmin(orderId)
		if (orderError) {
			return NextResponse.json({ error: orderError.message }, { status: 500 })
		}
		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 })
		}

		// Ya estaba completada: reintentar la entrega (idempotente) y devolverla.
		if (order.status === "completed") {
			const { data: delivered, outOfStock } = await fulfillOrder(orderId)
			return NextResponse.json({
				captured: true,
				alreadyCompleted: true,
				delivered: delivered ?? [],
				outOfStock,
			})
		}
		if (order.status === "cancelled" || order.status === "failed") {
			return NextResponse.json(
				{ error: `Order is ${order.status}` },
				{ status: 409 },
			)
		}

		// 2. Capturar el pago en PayPal
		const accessToken = await getAccessToken()
		const response = await fetch(
			`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			},
		)

		if (!response.ok) {
			const error = await response.json()
			return NextResponse.json(
				{ error: "Failed to capture PayPal payment", details: error },
				{ status: 502 },
			)
		}

		const captureData = await response.json()
		if (captureData.status !== "COMPLETED") {
			return NextResponse.json(
				{ error: `Capture not completed: ${captureData.status}` },
				{ status: 402 },
			)
		}

		// 3. Verificar que el monto capturado coincida con la orden (anti-fraude:
		// cubre un paypalOrderId forjado por el cliente con otro monto).
		const capture = extractCapture(captureData)
		if (!capture) {
			return NextResponse.json(
				{ error: "Could not read capture details" },
				{ status: 502 },
			)
		}

		let expected: number
		try {
			expected = await expectedUsdAmount(order)
		} catch {
			return NextResponse.json(
				{ error: "Could not determine order amount" },
				{ status: 422 },
			)
		}

		const amountMatches =
			capture.currency === "USD" &&
			Math.abs(capture.value - expected) <= AMOUNT_TOLERANCE_USD

		if (!amountMatches) {
			// Pago capturado pero NO coincide con la orden: no completar ni entregar.
			// Requiere revisión/refund manual.
			console.error(
				`PayPal amount mismatch order ${orderId}: captured ${capture.value} ${capture.currency}, expected ${expected} USD (capture ${capture.id})`,
			)
			return NextResponse.json(
				{ error: "Captured amount does not match order", needsReview: true },
				{ status: 422 },
			)
		}

		// 4. Marcar la orden completada con la referencia del pago (idempotente)
		const { error: completeError } = await completeOrderWithReference(
			orderId,
			capture.id,
		)
		if (completeError) {
			return NextResponse.json(
				{ error: completeError.message },
				{ status: 500 },
			)
		}

		// 5. Entregar la cuenta real en el mismo viaje
		const { data: delivered, outOfStock } = await fulfillOrder(orderId)

		return NextResponse.json({
			captured: true,
			transactionId: capture.id,
			delivered: delivered ?? [],
			outOfStock,
		})
	} catch (error) {
		console.error("PayPal capture error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}
