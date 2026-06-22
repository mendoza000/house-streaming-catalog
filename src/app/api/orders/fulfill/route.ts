import { type NextRequest, NextResponse } from "next/server";
import { fulfillOrder } from "@/api/fulfillment";
import { getOrderAdmin } from "@/api/orders-admin";
import { renewOrder } from "@/api/renewals";

/**
 * POST /api/orders/fulfill
 * Body: { orderId: number }
 *
 * Entrega una orden YA pagada (status `completed`): asigna pantallas reales y
 * devuelve las credenciales. Server-only (usa service-role vía fulfillOrder).
 * Para PayPal / Pago Móvil, que completan del lado cliente. Binance entrega
 * dentro de su propia route de verificación.
 */
export async function POST(request: NextRequest) {
	try {
		const { orderId } = await request.json();

		if (typeof orderId !== "number" || !Number.isInteger(orderId)) {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
		}

		// Solo se entrega lo que está pagado.
		const { data: order, error: orderError } = await getOrderAdmin(orderId);
		if (orderError) {
			return NextResponse.json({ error: orderError.message }, { status: 500 });
		}
		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}
		if (order.status !== "completed") {
			return NextResponse.json(
				{ error: "Order is not paid yet" },
				{ status: 409 },
			);
		}

		// Renovación: extender vencimiento (no asignar cuentas nuevas).
		if (order.kind === "renewal") {
			const { data: renewed, error: renewError } = await renewOrder(orderId);
			if (renewError) {
				return NextResponse.json(
					{ error: renewError.message },
					{ status: 500 },
				);
			}
			return NextResponse.json({ fulfilled: true, renewed: renewed ?? [] });
		}

		const { data, outOfStock, error } = await fulfillOrder(orderId);

		if (outOfStock) {
			return NextResponse.json({ fulfilled: false, reason: "out_of_stock" });
		}
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ fulfilled: true, delivered: data });
	} catch (error) {
		console.error("Order fulfill error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
