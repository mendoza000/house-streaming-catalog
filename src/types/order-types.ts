import type { CartItem } from "@/stores/cart-store";
import type { DeliveredAccount } from "@/types/delivery";
import type { RenewalResultItem } from "@/types/renewal-types";
import type { Json } from "@/types/supabase";

export type OrderStatus =
	| "draft"
	| "pending"
	| "validating"
	| "completed"
	| "failed"
	| "cancelled";

export interface OrderInfo {
	id: string;
	status: OrderStatus;
	paymentMethod: string;
	totalAmount: number;
	createdAt: Date;
	/** Token secreto para el link de seguimiento /orden/[token]. */
	trackingToken?: string;
}

/** Respuesta de GET /api/orders/track/[token]. Solo campos seguros. */
export interface OrderTrackingResponse {
	id: number;
	status: string | null;
	createdAt: string;
	amount: number | null;
	currency: string | null;
	items: Json | null;
	/** 'purchase' (entrega de credenciales) | 'renewal' (extensión de vencimiento). */
	kind: string;
	/** Credenciales entregadas; null salvo compra `completed`. */
	delivered: DeliveredAccount[] | null;
	/** Pantallas renovadas con su nuevo vencimiento; null salvo renovación `completed`. */
	renewed: RenewalResultItem[] | null;
	outOfStock: boolean;
}

export interface ClientFormData {
	name: string;
	phone: string;
	email: string;
}

export interface CreateOrderData {
	client_name: string;
	client_phone: string;
	client_email: string;
	amount: number;
	payment_method: string;
	currency: string;
	items: CartItem[];
}

export interface ClientFormErrors {
	name?: string;
	phone?: string;
	email?: string;
}
