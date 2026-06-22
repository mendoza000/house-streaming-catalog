import { type NextRequest, NextResponse } from "next/server";
import { createRenewalOrder } from "@/api/renewals";
import { PAYMENT_METHODS } from "@/constants/payment-methods";
import type { RenewalSelection } from "@/types/renewal-types";

/**
 * POST /api/account/renew
 * Body: { phone: string, selections: { client_id, months }[], methodId: string }
 *
 * Crea la orden de renovación server-side: revalida que las pantallas pertenezcan al
 * teléfono y recalcula el monto desde `screen_price` (el browser no fija el precio).
 * Devuelve `orderId` + `trackingToken` + monto para arrancar el pago con los mismos
 * componentes del checkout.
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { phone, selections, methodId } = body;

		if (typeof phone !== "string" || phone.trim().length < 7) {
			return NextResponse.json(
				{ error: "Número de teléfono inválido" },
				{ status: 400 },
			);
		}
		if (!Array.isArray(selections) || selections.length === 0) {
			return NextResponse.json(
				{ error: "Seleccioná al menos una cuenta para renovar" },
				{ status: 400 },
			);
		}

		const method = PAYMENT_METHODS.find((m) => m.id === methodId);
		if (!method) {
			return NextResponse.json(
				{ error: "Método de pago inválido" },
				{ status: 400 },
			);
		}

		// Sanitizar selecciones: solo client_id + months numéricos.
		const cleanSelections: RenewalSelection[] = [];
		for (const sel of selections) {
			const clientId = Number(sel?.client_id);
			const months = Number(sel?.months);
			if (!Number.isInteger(clientId) || !Number.isFinite(months)) {
				return NextResponse.json(
					{ error: "Selección inválida" },
					{ status: 400 },
				);
			}
			cleanSelections.push({ client_id: clientId, months });
		}

		const { data: order, error } = await createRenewalOrder({
			phone: phone.trim(),
			selections: cleanSelections,
			method,
		});

		if (error || !order) {
			return NextResponse.json(
				{ error: error?.message ?? "No se pudo crear la renovación" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			orderId: order.id,
			trackingToken: order.tracking_token,
			amount: order.amount,
			currency: order.currency,
		});
	} catch (error) {
		console.error("Account renew error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
