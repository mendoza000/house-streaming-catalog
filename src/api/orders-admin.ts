import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Order, OrderUpdate } from "@/types/supabase";

/**
 * Funciones de orden SERVER-ONLY que usan el cliente service-role.
 *
 * A diferencia de `src/api/orders.ts` (cliente anon, sujeto a RLS), estas
 * bypassean RLS para que la validación de pago pueda leer la orden y marcarla
 * `completed` desde el servidor. NO importar desde código de cliente.
 */

/**
 * Lee una orden por ID saltando RLS.
 */
export async function getOrderAdmin(
	orderId: number,
): Promise<{ data: Order | null; error: Error | null }> {
	try {
		const { data, error } = await supabaseAdmin
			.from("orders")
			.select("*")
			.eq("id", orderId)
			.maybeSingle();

		if (error) {
			console.error("Error fetching order (admin):", error);
			return { data: null, error: new Error(error.message) };
		}

		return { data, error: null };
	} catch (error) {
		console.error("Unexpected error fetching order (admin):", error);
		return {
			data: null,
			error:
				error instanceof Error ? error : new Error("Failed to fetch order"),
		};
	}
}

/**
 * Lee una orden por su token de seguimiento (secreto) saltando RLS.
 * Clave de acceso de la página /orden/[token]: el token es imposible de
 * enumerar, a diferencia del id secuencial.
 */
export async function getOrderByTrackingToken(
	trackingToken: string,
): Promise<{ data: Order | null; error: Error | null }> {
	try {
		const { data, error } = await supabaseAdmin
			.from("orders")
			.select("*")
			.eq("tracking_token", trackingToken)
			.maybeSingle();

		if (error) {
			console.error("Error fetching order by tracking token:", error);
			return { data: null, error: new Error(error.message) };
		}

		return { data, error: null };
	} catch (error) {
		console.error("Unexpected error fetching order by tracking token:", error);
		return {
			data: null,
			error:
				error instanceof Error ? error : new Error("Failed to fetch order"),
		};
	}
}

/**
 * Busca una orden ya asociada a un transactionId de Binance.
 * Usado para impedir que una misma transacción complete dos órdenes.
 */
export async function findOrderByPaymentReference(
	paymentReference: string,
): Promise<{ data: Order | null; error: Error | null }> {
	try {
		const { data, error } = await supabaseAdmin
			.from("orders")
			.select("*")
			.eq("payment_reference", paymentReference)
			.maybeSingle();

		if (error) {
			console.error("Error finding order by payment reference:", error);
			return { data: null, error: new Error(error.message) };
		}

		return { data, error: null };
	} catch (error) {
		console.error(
			"Unexpected error finding order by payment reference:",
			error,
		);
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to find order by payment reference"),
		};
	}
}

/**
 * Marca una orden como `completed` y guarda el transactionId que la confirmó.
 * El índice único parcial sobre payment_reference garantiza idempotencia a
 * nivel de base de datos.
 */
export async function completeOrderWithReference(
	orderId: number,
	paymentReference: string,
): Promise<{ data: Order | null; error: Error | null }> {
	try {
		const updateData: OrderUpdate = {
			status: "completed",
			payment_reference: paymentReference,
		};

		const { data, error } = await supabaseAdmin
			.from("orders")
			.update(updateData)
			.eq("id", orderId)
			.select("*")
			.single();

		if (error) {
			console.error("Error completing order with reference:", error);
			return { data: null, error: new Error(error.message) };
		}

		return { data, error: null };
	} catch (error) {
		console.error("Unexpected error completing order with reference:", error);
		return {
			data: null,
			error:
				error instanceof Error ? error : new Error("Failed to complete order"),
		};
	}
}
