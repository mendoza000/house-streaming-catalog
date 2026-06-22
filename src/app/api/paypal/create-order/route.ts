import { type NextRequest, NextResponse } from "next/server";
import { getOrderAdmin } from "@/api/orders-admin";
import { expectedUsdAmount } from "@/lib/paypal/amount";
import { getPayPalAccessToken, PAYPAL_API_BASE } from "@/lib/paypal/client";

/**
 * POST /api/paypal/create-order
 * Body: { orderId: number }
 *
 * Crea un order de PayPal usando el monto de NUESTRA orden en DB como fuente de
 * verdad (service-role). El cliente solo manda el id; no puede influir el monto.
 */
export async function POST(request: NextRequest) {
	try {
		const { orderId } = await request.json();

		if (typeof orderId !== "number" || !Number.isInteger(orderId)) {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
		}

		const { data: order, error: orderError } = await getOrderAdmin(orderId);
		if (orderError) {
			return NextResponse.json({ error: orderError.message }, { status: 500 });
		}
		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		let amountUsd: number;
		try {
			amountUsd = await expectedUsdAmount(order);
		} catch {
			return NextResponse.json(
				{ error: "Could not determine order amount" },
				{ status: 422 },
			);
		}

		const accessToken = await getPayPalAccessToken();

		const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				intent: "CAPTURE",
				purchase_units: [
					{
						amount: { currency_code: "USD", value: amountUsd.toFixed(2) },
						custom_id: `ord-${orderId}`,
					},
				],
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			return NextResponse.json(
				{ error: "Failed to create PayPal order", details: error },
				{ status: 500 },
			);
		}

		const paypalOrder = await response.json();
		return NextResponse.json(paypalOrder);
	} catch (error) {
		console.error("PayPal create order error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
