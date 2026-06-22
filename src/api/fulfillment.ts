import { supabaseAdmin } from "@/lib/supabase/admin";
import {
	type DeliveredAccount,
	deliveredAccountsSchema,
} from "@/types/delivery";

/**
 * Funciones de ENTREGA, server-only (cliente service-role).
 * La asignación de pantallas es atómica y vive en la función Postgres
 * `fulfill_order`; acá solo la invocamos y mapeamos el resultado.
 */

interface FulfillResult {
	data: DeliveredAccount[] | null;
	/** true si no había stock suficiente (la entrega se revirtió entera). */
	outOfStock: boolean;
	error: Error | null;
}

/**
 * Entrega una orden ya pagada: asigna pantallas, registra clients + sales y
 * devuelve las credenciales. Idempotente (reintentos devuelven lo mismo).
 */
export async function fulfillOrder(orderId: number): Promise<FulfillResult> {
	try {
		const { data, error } = await supabaseAdmin.rpc("fulfill_order", {
			p_order_id: orderId,
		});

		if (error) {
			if (error.message?.includes("OUT_OF_STOCK")) {
				return {
					data: null,
					outOfStock: true,
					error: new Error("OUT_OF_STOCK"),
				};
			}
			console.error("fulfill_order error:", error);
			return { data: null, outOfStock: false, error: new Error(error.message) };
		}

		// El RPC llega como `any`. Validamos la forma antes de entregar: si viene
		// malformado preferimos fallar (revisión manual) a entregar basura.
		let delivered: DeliveredAccount[];
		try {
			delivered = deliveredAccountsSchema.validateSync(data ?? []);
		} catch (validationError) {
			console.error("fulfill_order returned malformed data:", validationError);
			return {
				data: null,
				outOfStock: false,
				error: new Error("fulfill_order returned malformed data"),
			};
		}

		return { data: delivered, outOfStock: false, error: null };
	} catch (error) {
		console.error("Unexpected error fulfilling order:", error);
		return {
			data: null,
			outOfStock: false,
			error:
				error instanceof Error ? error : new Error("Failed to fulfill order"),
		};
	}
}
