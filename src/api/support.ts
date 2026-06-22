import { supabaseAdmin } from "@/lib/supabase/admin";
import type { TicketInsert } from "@/types/supabase";

/**
 * Solicitudes de soporte originadas en la web, server-only.
 *
 * Inserta un ticket con source='web' y type='support' en la tabla compartida
 * `tickets`. El bot Go (wabot-v3) lo detecta por polling, lo notifica al admin
 * por Telegram y este lo atiende. El soporte se resuelve de forma conversacional
 * vía WhatsApp/admin, por lo que el catálogo NO poolea el estado.
 */

export interface CreateSupportInput {
	clientName: string;
	clientPhone: string;
	description: string;
	/** Servicio afectado (opcional). */
	serviceId?: number;
	/** URL pública de la captura adjunta (opcional). */
	receiptUrl?: string;
}

export async function createSupportRequest(
	input: CreateSupportInput,
): Promise<{ data: { ticketId: string } | null; error: Error | null }> {
	try {
		// Mirror de lo que inserta el bot Go (campos NOT NULL con defaults seguros).
		const insert: TicketInsert = {
			type: "support",
			status: "pending",
			source: "web",
			client_name: input.clientName,
			client_phone: input.clientPhone,
			description: input.description,
			service_id: input.serviceId ?? null,
			receipt_url: input.receiptUrl ?? "",
			months: 0,
			screen_number: 0,
			telegram_msg_id: 0,
		};

		const { data, error } = await supabaseAdmin
			.from("tickets")
			.insert(insert)
			.select("id")
			.single();

		if (error) {
			console.error("Error creating support request:", error);
			return { data: null, error: new Error(error.message) };
		}

		return { data: { ticketId: data.id }, error: null };
	} catch (error) {
		console.error("Unexpected error creating support request:", error);
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to create support request"),
		};
	}
}
