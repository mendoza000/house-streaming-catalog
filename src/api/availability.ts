import { supabaseAdmin } from "@/lib/supabase/admin"
import type { TicketInsert } from "@/types/supabase"

/**
 * Consultas de disponibilidad para servicios BAJO PEDIDO, server-only.
 *
 * Inserta un ticket con source='web' en la tabla compartida `tickets`. El bot
 * Go (wabot-v3) lo detecta, le pregunta al admin por Telegram y resuelve el
 * ticket (status='resolved', resolved_action='available'|'not_available').
 * El catálogo polea el estado hasta tener respuesta.
 */

export interface CreateAvailabilityInput {
	serviceId: number
	clientName: string
	clientPhone: string
	months: number
	/** Agrupa las consultas de un mismo checkout. */
	cartId?: string
}

export async function createAvailabilityRequest(
	input: CreateAvailabilityInput,
): Promise<{ data: { ticketId: string } | null; error: Error | null }> {
	try {
		// Mirror de lo que inserta el bot Go (campos NOT NULL con defaults seguros).
		const insert: TicketInsert = {
			type: "availability",
			status: "pending",
			source: "web",
			service_id: input.serviceId,
			client_name: input.clientName,
			client_phone: input.clientPhone,
			months: input.months,
			screen_number: 0,
			description: "Consulta de disponibilidad (web)",
			receipt_url: "",
			telegram_msg_id: 0,
			cart_id: input.cartId ?? null,
		}

		const { data, error } = await supabaseAdmin
			.from("tickets")
			.insert(insert)
			.select("id")
			.single()

		if (error) {
			console.error("Error creating availability request:", error)
			return { data: null, error: new Error(error.message) }
		}

		return { data: { ticketId: data.id }, error: null }
	} catch (error) {
		console.error("Unexpected error creating availability request:", error)
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to create availability request"),
		}
	}
}

export interface CreatePaymentValidationInput {
	orderId: number
	clientName: string
	clientPhone: string
	receiptUrl: string
	/** Resumen para que el admin sepa qué está validando. */
	description: string
}

/**
 * Crea un ticket de VALIDACIÓN DE PAGO manual (Pago Móvil) originado en la web.
 * El bot lo notifica al admin con [Aprobar]/[Rechazar]; al resolverlo, un
 * trigger en Supabase completa la orden y la entrega (o la marca failed).
 */
export async function createPaymentValidationRequest(
	input: CreatePaymentValidationInput,
): Promise<{ data: { ticketId: string } | null; error: Error | null }> {
	try {
		const insert: TicketInsert = {
			type: "payment",
			status: "pending",
			source: "web",
			order_id: input.orderId,
			client_name: input.clientName,
			client_phone: input.clientPhone,
			receipt_url: input.receiptUrl,
			description: input.description,
			screen_number: 0,
			telegram_msg_id: 0,
		}

		const { data, error } = await supabaseAdmin
			.from("tickets")
			.insert(insert)
			.select("id")
			.single()

		if (error) {
			console.error("Error creating payment validation request:", error)
			return { data: null, error: new Error(error.message) }
		}

		// Marcar la orden en revisión (server-side: bypassa la RLS que solo deja
		// a anon tocar drafts). Best-effort.
		await supabaseAdmin
			.from("orders")
			.update({ status: "validating" })
			.eq("id", input.orderId)
			.neq("status", "completed")

		return { data: { ticketId: data.id }, error: null }
	} catch (error) {
		console.error("Unexpected error creating payment validation request:", error)
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to create payment validation request"),
		}
	}
}

export interface AvailabilityStatus {
	/** pending | resolved | approved | rejected ... */
	status: string | null
	/** available | not_available | null (aún sin responder) */
	resolvedAction: string | null
}

export async function getAvailabilityStatus(
	ticketId: string,
): Promise<{ data: AvailabilityStatus | null; error: Error | null }> {
	try {
		const { data, error } = await supabaseAdmin
			.from("tickets")
			.select("status, resolved_action")
			.eq("id", ticketId)
			.maybeSingle()

		if (error) {
			console.error("Error fetching availability status:", error)
			return { data: null, error: new Error(error.message) }
		}
		if (!data) {
			return { data: null, error: new Error("Ticket not found") }
		}

		return {
			data: { status: data.status, resolvedAction: data.resolved_action },
			error: null,
		}
	} catch (error) {
		console.error("Unexpected error fetching availability status:", error)
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to fetch availability status"),
		}
	}
}
