import { supabase } from "@/lib/supabase/client"
import type { CreateOrderData } from "@/types/order-types"
import type { Order, OrderInsert, OrderUpdate, Json } from "@/types/supabase"
import { generateCartHash } from "@/utils/cart-hash"

/**
 * Finds an existing draft order for a client with the same cart
 * @param clientEmail - Client email
 * @param cartHash - Hash of the cart items
 * @returns Promise with the draft order if found
 */
export async function findDraftOrder(
	clientEmail: string,
	cartHash: string,
): Promise<{ data: Order | null; error: Error | null }> {
	try {
		const { data: order, error } = await supabase
			.from("orders")
			.select("*")
			.eq("client_email", clientEmail)
			.eq("cart_hash", cartHash)
			.eq("status", "draft")
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle()

		if (error) {
			console.error("Error finding draft order:", error)
			return { data: null, error: new Error(error.message) }
		}

		return { data: order, error: null }
	} catch (error) {
		console.error("Unexpected error finding draft order:", error)
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to find draft order"),
		}
	}
}

/**
 * Creates a new order or updates existing draft order
 * @param data - Order data including client info, amount, items, etc.
 * @returns Promise with the created/updated order
 */
export async function createOrUpdateDraftOrder(
	data: CreateOrderData,
): Promise<{ data: Order | null; error: Error | null }> {
	try {
		const cartHash = generateCartHash(data.items)

		// Buscar draft existente
		const { data: existingDraft } = await findDraftOrder(
			data.client_email,
			cartHash,
		)

		if (existingDraft) {
			// Actualizar draft existente
			const updateData: OrderUpdate = {
				client_name: data.client_name,
				client_phone: data.client_phone,
				amount: data.amount,
				payment_method: data.payment_method,
				currency: data.currency,
				items: data.items as unknown as Json,
				cart_hash: cartHash,
			}
			
			const { data: updatedOrder, error } = await supabase
				.from("orders")
				.update(updateData)
				.eq("id", existingDraft.id)
				.select("*")
				.maybeSingle()

			if (error) {
				console.error("Error updating draft order:", error)
				return { data: null, error: new Error(error.message) }
			}

			// Si el UPDATE no retornó nada por RLS, retornar el draft original
			if (!updatedOrder) {
				console.error("UPDATE blocked by RLS, using existing draft")
				return { data: existingDraft, error: null }
			}

			return { data: updatedOrder, error: null }
		} else {
			// Crear nueva orden draft
			const insertData: OrderInsert = {
				client_name: data.client_name,
				client_phone: data.client_phone,
				client_email: data.client_email,
				amount: data.amount,
				payment_method: data.payment_method,
				currency: data.currency,
				items: data.items as unknown as Json,
				cart_hash: cartHash,
				status: "draft",
			}
			
			const { data: newOrder, error } = await supabase
				.from("orders")
				.insert(insertData)
				.select("*")
				.single()

			if (error) {
				console.error("Error creating draft order:", error)
				return { data: null, error: new Error(error.message) }
			}

			return { data: newOrder, error: null }
		}
	} catch (error) {
		console.error("Unexpected error creating/updating draft order:", error)
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to create/update draft order"),
		}
	}
}

/**
 * Gets an order by ID
 * @param orderId - The order ID
 * @returns Promise with the order data
 */
export async function getOrder(
	orderId: number,
): Promise<{ data: Order | null; error: Error | null }> {
	try {
		const { data: order, error } = await supabase
			.from("orders")
			.select("*")
			.eq("id", orderId)
			.single()

		if (error) {
			console.error("Error fetching order:", error)
			return { data: null, error: new Error(error.message) }
		}

		return { data: order, error: null }
	} catch (error) {
		console.error("Unexpected error fetching order:", error)
		return {
			data: null,
			error:
				error instanceof Error ? error : new Error("Failed to fetch order"),
		}
	}
}

/**
 * Gets orders by client email
 * @param email - Client email address
 * @returns Promise with array of orders
 */
export async function getOrdersByEmail(
	email: string,
): Promise<{ data: Order[] | null; error: Error | null }> {
	try {
		const { data: orders, error } = await supabase
			.from("orders")
			.select("*")
			.eq("client_email", email)
			.order("created_at", { ascending: false })

		if (error) {
			console.error("Error fetching orders by email:", error)
			return { data: null, error: new Error(error.message) }
		}

		return { data: orders, error: null }
	} catch (error) {
		console.error("Unexpected error fetching orders:", error)
		return {
			data: null,
			error:
				error instanceof Error ? error : new Error("Failed to fetch orders"),
		}
	}
}
