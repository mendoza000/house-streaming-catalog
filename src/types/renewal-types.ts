import type { PaymentMethod } from "@/constants/payment-methods";
import type { RenewableAccount } from "@/types/supabase";
import type { MethodSettlement } from "@/utils/settlement";

export type { RenewableAccount };

/** Resultado de crear la orden de renovación, listo para el paso de pago. */
export interface RenewalCreatedPayload {
	method: PaymentMethod;
	settlement: MethodSettlement;
	orderId: number;
	trackingToken: string;
}

/**
 * Lo que el usuario elige renovar: una pantalla concreta (client_id) y por cuántos
 * meses. Es el único input que el cliente manda al servidor; el precio se recalcula
 * server-side desde `services.screen_price` (el browser no decide cuánto se cobra).
 */
export interface RenewalSelection {
	client_id: number;
	months: number;
}

/**
 * Línea de renovación persistida en `orders.items`. La función SQL `renew_order` solo
 * lee `client_id` + `months`; el resto es para mostrar y trazar.
 */
export interface RenewalOrderItem {
	client_id: number;
	service: string;
	screen: number;
	months: number;
	/** Base en USD de la línea (`screen_price × months`), antes de moneda/recargo. */
	amount: number;
}

/** Resultado de aplicar una renovación: nuevo vencimiento por pantalla. */
export interface RenewalResultItem {
	service: string | null;
	screen: number | null;
	expires_at: string | null;
}

/** Estado de vigencia de una pantalla, derivado de `expires_at`. */
export type ExpiryStatus = "none" | "active" | "soon" | "expired";
