import { type NextRequest, NextResponse } from "next/server"
import { fulfillOrder } from "@/api/fulfillment"
import { getOrderByTrackingToken } from "@/api/orders-admin"
import type { OrderTrackingResponse } from "@/types/order-types"

/**
 * GET /api/orders/track/[token]
 * Estado público de una orden por su token secreto (no por id). Si está
 * `completed`, incluye las credenciales entregadas (vía fulfillOrder,
 * idempotente). Solo expone campos seguros — nunca PII como el teléfono.
 * Server-only: usa service-role (el anon key no puede leer clients/sales).
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ token: string }> },
) {
	try {
		const { token } = await params

		const { data: order, error: orderError } =
			await getOrderByTrackingToken(token)

		if (orderError) {
			return NextResponse.json({ error: orderError.message }, { status: 500 })
		}
		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 })
		}

		const base: OrderTrackingResponse = {
			id: order.id,
			status: order.status,
			createdAt: order.created_at,
			amount: order.amount,
			currency: order.currency,
			items: order.items,
			delivered: null,
			outOfStock: false,
		}

		// Solo se entregan credenciales de órdenes pagadas.
		if (order.status === "completed") {
			const { data, outOfStock, error } = await fulfillOrder(order.id)
			if (error) {
				return NextResponse.json({ error: error.message }, { status: 500 })
			}
			base.outOfStock = outOfStock
			base.delivered = data
		}

		return NextResponse.json(base)
	} catch (error) {
		console.error("Order tracking error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}
