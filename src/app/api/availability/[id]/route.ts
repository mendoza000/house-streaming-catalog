import { type NextRequest, NextResponse } from "next/server"
import { getAvailabilityStatus } from "@/api/availability"

/**
 * GET /api/availability/[id]
 * Devuelve el estado de una consulta de disponibilidad para que el cliente
 * la poolee: { status, resolvedAction }.
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params

		const { data, error } = await getAvailabilityStatus(id)

		if (error) {
			const status = error.message === "Ticket not found" ? 404 : 500
			return NextResponse.json({ error: error.message }, { status })
		}

		return NextResponse.json(data)
	} catch (error) {
		console.error("Availability status error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}
