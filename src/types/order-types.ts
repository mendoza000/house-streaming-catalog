import type { Json } from "@/types/supabase"
import type { DeliveredAccount } from "@/types/delivery"
import type { CartItem } from "@/stores/cart-store"

export type OrderStatus = "draft" | "pending" | "validating" | "completed" | "failed" | "cancelled"

export interface OrderInfo {
	id: string
	status: OrderStatus
	paymentMethod: string
	totalAmount: number
	createdAt: Date
	/** Token secreto para el link de seguimiento /orden/[token]. */
	trackingToken?: string
}

/** Respuesta de GET /api/orders/track/[token]. Solo campos seguros. */
export interface OrderTrackingResponse {
	id: number
	status: string | null
	createdAt: string
	amount: number | null
	currency: string | null
	items: Json | null
	/** Credenciales entregadas; null salvo que la orden esté `completed`. */
	delivered: DeliveredAccount[] | null
	outOfStock: boolean
}

export interface ClientFormData {
	name: string
	phone: string
	email: string
}

export interface CreateOrderData {
	client_name: string
	client_phone: string
	client_email: string
	amount: number
	payment_method: string
	currency: string
	items: CartItem[]
}

export interface ClientFormErrors {
	name?: string
	phone?: string
	email?: string
}
