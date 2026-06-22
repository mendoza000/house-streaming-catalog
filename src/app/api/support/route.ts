import { type NextRequest, NextResponse } from "next/server";
import { createSupportRequest } from "@/api/support";

/**
 * POST /api/support
 * Body: { clientName, clientPhone, description, serviceId?, receiptUrl? }
 *
 * Crea una solicitud de soporte (ticket source='web', type='support'). El bot
 * la notifica al admin por Telegram para que la atienda.
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { clientName, clientPhone, description, serviceId, receiptUrl } =
			body;

		if (typeof clientName !== "string" || clientName.trim() === "") {
			return NextResponse.json(
				{ error: "clientName is required" },
				{ status: 400 },
			);
		}
		if (typeof clientPhone !== "string" || clientPhone.trim() === "") {
			return NextResponse.json(
				{ error: "clientPhone is required" },
				{ status: 400 },
			);
		}
		if (typeof description !== "string" || description.trim() === "") {
			return NextResponse.json(
				{ error: "description is required" },
				{ status: 400 },
			);
		}

		const { data, error } = await createSupportRequest({
			clientName,
			clientPhone,
			description,
			serviceId:
				typeof serviceId === "number" && Number.isInteger(serviceId)
					? serviceId
					: undefined,
			receiptUrl: typeof receiptUrl === "string" ? receiptUrl : undefined,
		});

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ ticketId: data?.ticketId });
	} catch (error) {
		console.error("Support create error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
