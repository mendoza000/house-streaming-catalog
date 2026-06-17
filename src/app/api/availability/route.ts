import { type NextRequest, NextResponse } from "next/server";
import { createAvailabilityRequest } from "@/api/availability";

/**
 * POST /api/availability
 * Body: { serviceId, clientName, clientPhone, months, cartId? }
 *
 * Crea una consulta de disponibilidad (ticket source='web') para un servicio
 * bajo pedido. Devuelve el ticketId para que el cliente poolee el resultado.
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { serviceId, clientName, clientPhone, months, cartId } = body;

		if (typeof serviceId !== "number" || !Number.isInteger(serviceId)) {
			return NextResponse.json({ error: "Invalid serviceId" }, { status: 400 });
		}
		if (typeof clientPhone !== "string" || clientPhone.trim() === "") {
			return NextResponse.json(
				{ error: "clientPhone is required" },
				{ status: 400 },
			);
		}

		const { data, error } = await createAvailabilityRequest({
			serviceId,
			clientName: typeof clientName === "string" ? clientName : "",
			clientPhone,
			months: typeof months === "number" ? months : 1,
			cartId: typeof cartId === "string" ? cartId : undefined,
		});

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ ticketId: data?.ticketId });
	} catch (error) {
		console.error("Availability create error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
