import { getOrdersByEmail } from "@/api/orders";
import { supabase } from "@/lib/supabase/client";
import type { MyStreamingAccount } from "@/types/account-types";

export { getOrdersByEmail as getMyOrders };

/**
 * Trae las cuentas de streaming del cliente autenticado vía
 * GET /api/account/credentials (server-side, service-role). Nunca se consulta
 * `clients`/`sales`/`accounts` directo desde el browser.
 */
export async function getMyStreamingAccounts(): Promise<{
	data: MyStreamingAccount[] | null;
	error: Error | null;
}> {
	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session) {
			return { data: null, error: new Error("No hay sesión activa") };
		}

		const res = await fetch("/api/account/credentials", {
			headers: { Authorization: `Bearer ${session.access_token}` },
		});
		const json = await res.json();

		if (!res.ok) {
			return {
				data: null,
				error: new Error(json.error ?? "No pudimos obtener tus cuentas"),
			};
		}

		return { data: (json.accounts ?? []) as MyStreamingAccount[], error: null };
	} catch (error) {
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("No pudimos obtener tus cuentas"),
		};
	}
}
