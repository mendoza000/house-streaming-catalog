import { supabase } from "@/lib/supabase/client"
import type { Service } from "@/types/supabase"

/**
 * Fetch all services from Supabase
 * Filters out hidden services by default
 */
export async function getServices(): Promise<Service[]> {
	const { data, error } = await supabase
		.from("services")
		.select("*")
		.eq("hidden", false)
		.order("id", { ascending: true })

	if (error) throw error
	return data ?? []
}

/**
 * Stock (pantallas disponibles) por servicio, desde la vista `service_stock`.
 * Devuelve un mapa { service_id: available } para mergear en el catálogo.
 */
export async function getServiceStock(): Promise<Record<number, number>> {
	const { data, error } = await supabase
		.from("service_stock")
		.select("service_id, available")

	if (error) throw error

	const stock: Record<number, number> = {}
	for (const row of data ?? []) {
		if (row.service_id != null) {
			stock[row.service_id] = row.available ?? 0
		}
	}
	return stock
}

/**
 * Fetch a single service by ID
 */
export async function getServiceById(id: number): Promise<Service | null> {
	const { data, error } = await supabase
		.from("services")
		.select("*")
		.eq("id", id)
		.eq("hidden", false)
		.single()

	if (error) throw error
	return data
}
