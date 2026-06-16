import { type NextRequest, NextResponse } from "next/server"
import { createPaymentValidationRequest } from "@/api/availability"

/**
 * POST /api/payment-validation
 * Body: { orderId, clientName, clientPhone, receiptUrl, description }
 *
 * Crea un ticket de validación de pago manual (Pago Móvil). El admin lo aprueba
 * o rechaza por Telegram; el catálogo poolea el resultado vía GET /api/availability/[id].
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { orderId, clientName, clientPhone, receiptUrl, description } = body

		if (typeof orderId !== "number" || !Number.isInteger(orderId)) {
			return NextResponse.json({ error: "Invalid orderId" }, { status: 400 })
		}
		if (typeof receiptUrl !== "string" || receiptUrl.trim() === "") {
			return NextResponse.json(
				{ error: "receiptUrl is required" },
				{ status: 400 },
			)
		}

		const { data, error } = await createPaymentValidationRequest({
			orderId,
			clientName: typeof clientName === "string" ? clientName : "",
			clientPhone: typeof clientPhone === "string" ? clientPhone : "",
			receiptUrl,
			description: typeof description === "string" ? description : "",
		})

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ ticketId: data?.ticketId })
	} catch (error) {
		console.error("Payment validation create error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}
