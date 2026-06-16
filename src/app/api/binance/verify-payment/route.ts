import { type NextRequest, NextResponse } from "next/server"
import { getExchangeRate } from "@/api/exchange-rate"
import { fulfillOrder } from "@/api/fulfillment"
import {
	completeOrderWithReference,
	findOrderByPaymentReference,
	getOrderAdmin,
} from "@/api/orders-admin"
import { getPayTransactions } from "@/lib/binance/client"
import { findMatchingTransactions } from "@/lib/binance/match-payment"

/** Margen hacia atrás para empezar a buscar transacciones, por desfasajes de reloj. */
const START_TIME_BUFFER_MS = 10 * 60 * 1000

/**
 * POST /api/binance/verify-payment
 * Body: { orderId: number }
 *
 * Verifica contra la API de Binance si llegó el pago de una orden:
 * busca una transacción cuya nota contenga `ord-{orderId}`, en USDT, por el
 * monto esperado (convertido a USD), no usada antes. Si la encuentra, marca la
 * orden `completed`. El secret de Binance y el service-role viven solo acá.
 */
export async function POST(request: NextRequest) {
	try {
		const { orderId } = await request.json()

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
				matched: true,
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

		if (order.amount == null) {
			return NextResponse.json(
				{ error: "Order has no amount" },
				{ status: 422 },
			)
		}

		// 2. Monto esperado en USD (USDT 1:1). Si la orden está en VES, convertir.
		let expectedAmountUsd = order.amount
		if (order.currency === "VES") {
			try {
				const rate = await getExchangeRate() // VES por 1 USDT
				expectedAmountUsd = order.amount / rate
			} catch {
				return NextResponse.json(
					{ error: "Could not fetch exchange rate" },
					{ status: 502 },
				)
			}
		}

		// 3. Traer historial de Binance Pay desde un poco antes de crear la orden
		const startTime =
			new Date(order.created_at).getTime() - START_TIME_BUFFER_MS
		const { data: transactions, error: binanceError } =
			await getPayTransactions({ startTime })

		if (binanceError) {
			return NextResponse.json({ error: binanceError.message }, { status: 502 })
		}

		// 4. Matchear por nota + moneda + monto
		const candidates = findMatchingTransactions(transactions ?? [], {
			orderCode: `ord-${orderId}`,
			expectedAmountUsd,
		})

		// 5. Descartar transacciones ya usadas por otra orden (anti-reuso)
		for (const tx of candidates) {
			const { data: existing } = await findOrderByPaymentReference(
				tx.transactionId,
			)
			if (existing && existing.id !== orderId) continue

			const { data: completed, error: completeError } =
				await completeOrderWithReference(orderId, tx.transactionId)

			if (completeError) {
				return NextResponse.json(
					{ error: completeError.message },
					{ status: 500 },
				)
			}

			// Pago confirmado → entregar la cuenta real en el mismo viaje.
			const { data: delivered, outOfStock } = await fulfillOrder(orderId)

			return NextResponse.json({
				matched: true,
				order: completed,
				transactionId: tx.transactionId,
				delivered: delivered ?? [],
				outOfStock,
			})
		}

		// 6. Sin pago detectado todavía
		return NextResponse.json({ matched: false })
	} catch (error) {
		console.error("Binance verify-payment error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}
