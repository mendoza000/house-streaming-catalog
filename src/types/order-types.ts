import type { CartItem } from "@/stores/cart-store"

export type OrderStatus = "draft" | "pending" | "validating" | "completed" | "failed" | "cancelled"

export interface OrderInfo {
	id: string
	status: OrderStatus
	paymentMethod: string
	totalAmount: number
	createdAt: Date
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
