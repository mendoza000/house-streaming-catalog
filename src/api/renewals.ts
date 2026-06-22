import { getExchangeRate } from "@/api/exchange-rate";
import type { PaymentMethod } from "@/constants/payment-methods";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { CartItem } from "@/stores/cart-store";
import type {
	RenewalOrderItem,
	RenewalResultItem,
	RenewalSelection,
} from "@/types/renewal-types";
import type { Json, Order, RenewableAccount } from "@/types/supabase";
import { getMethodSettlement } from "@/utils/settlement";

/**
 * Funciones de RENOVACIÓN, server-only (cliente service-role).
 *
 * Igual que `fulfillment.ts`/`orders-admin.ts`: bypassean RLS y NUNCA se importan
 * desde código de cliente. La identidad del cliente es el teléfono; el precio se
 * recalcula acá desde `services.screen_price` para que el browser no pueda forjarlo.
 */

/** Mínimos/máximos de meses por renovación (defensa contra inputs absurdos). */
const MIN_MONTHS = 1;
const MAX_MONTHS = 12;

/**
 * Devuelve las pantallas renovables de un teléfono (web y wabot), sin credenciales.
 * Resuelto por la función SQL que normaliza el teléfono.
 */
export async function lookupRenewableAccounts(
	phone: string,
): Promise<{ data: RenewableAccount[] | null; error: Error | null }> {
	try {
		const { data, error } = await supabaseAdmin.rpc(
			"lookup_renewable_accounts",
			{ p_phone: phone },
		);

		if (error) {
			console.error("lookup_renewable_accounts error:", error);
			return { data: null, error: new Error(error.message) };
		}

		return { data: (data ?? []) as RenewableAccount[], error: null };
	} catch (error) {
		console.error("Unexpected error looking up renewable accounts:", error);
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to look up renewable accounts"),
		};
	}
}

/**
 * Crea una orden de renovación (`kind='renewal'`, `status='draft'`) server-side.
 *
 * Autorización: revalida que cada `client_id` elegido pertenezca al teléfono. El
 * monto se computa con `getMethodSettlement` usando el `screen_price` autoritativo
 * (misma fuente de verdad que el checkout de compra). Devuelve la orden con su
 * `id` + `tracking_token` para arrancar el pago.
 */
export async function createRenewalOrder(input: {
	phone: string;
	selections: RenewalSelection[];
	method: PaymentMethod;
}): Promise<{ data: Order | null; error: Error | null }> {
	try {
		const { phone, selections, method } = input;

		if (!selections.length) {
			return { data: null, error: new Error("No selections provided") };
		}

		// 1. Set autoritativo de pantallas de ESE teléfono.
		const { data: accounts, error: lookupError } =
			await lookupRenewableAccounts(phone);
		if (lookupError) return { data: null, error: lookupError };
		if (!accounts?.length) {
			return { data: null, error: new Error("No accounts found for phone") };
		}

		const byClientId = new Map(accounts.map((a) => [a.client_id, a]));

		// 2. Validar selecciones contra ese set y armar líneas con precio autoritativo.
		const lines: RenewalOrderItem[] = [];
		const pseudoItems: CartItem[] = [];
		for (const sel of selections) {
			const acc = byClientId.get(sel.client_id);
			if (!acc) {
				return {
					data: null,
					error: new Error(`client_id ${sel.client_id} not owned by phone`),
				};
			}
			const months = Math.max(
				MIN_MONTHS,
				Math.min(MAX_MONTHS, Math.trunc(sel.months) || MIN_MONTHS),
			);
			lines.push({
				client_id: acc.client_id,
				service: acc.service,
				screen: acc.screen,
				months,
				amount: acc.screen_price * months,
			});
			pseudoItems.push({
				id: String(acc.service_id),
				title: acc.service,
				price: acc.screen_price,
				accounts: 1,
				quantity: 1,
				months,
			});
		}

		// 3. Monto a cobrar según el método (misma lógica que el checkout de compra).
		let exchangeRate: number | undefined;
		if (method.currency === "VES") {
			exchangeRate = await getExchangeRate();
		}
		const settlement = getMethodSettlement(method, pseudoItems, exchangeRate);

		// 4. Insertar la orden (admin: bypassa RLS y devuelve la fila creada).
		const { data: order, error } = await supabaseAdmin
			.from("orders")
			.insert({
				kind: "renewal",
				status: "draft",
				client_phone: phone,
				amount: settlement.total,
				currency: settlement.currency,
				payment_method: method.name,
				items: lines as unknown as Json,
			})
			.select("*")
			.single();

		if (error) {
			console.error("Error creating renewal order:", error);
			return { data: null, error: new Error(error.message) };
		}

		return { data: order, error: null };
	} catch (error) {
		console.error("Unexpected error creating renewal order:", error);
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to create renewal order"),
		};
	}
}

/**
 * Aplica una renovación ya pagada: extiende `expires_at` de cada pantalla. Idempotente
 * (la función SQL no extiende dos veces). Espeja la firma de `fulfillOrder`.
 */
export async function renewOrder(
	orderId: number,
): Promise<{ data: RenewalResultItem[] | null; error: Error | null }> {
	try {
		const { data, error } = await supabaseAdmin.rpc("renew_order", {
			p_order_id: orderId,
		});

		if (error) {
			console.error("renew_order error:", error);
			return { data: null, error: new Error(error.message) };
		}

		return {
			data: (data ?? []) as unknown as RenewalResultItem[],
			error: null,
		};
	} catch (error) {
		console.error("Unexpected error renewing order:", error);
		return {
			data: null,
			error:
				error instanceof Error ? error : new Error("Failed to renew order"),
		};
	}
}
