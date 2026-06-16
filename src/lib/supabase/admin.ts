import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

/**
 * Cliente Supabase SERVER-ONLY con service-role.
 *
 * Bypassea RLS — necesario para que la validación de pago lea la orden y la
 * marque `completed` desde el servidor (las políticas RLS solo dejan a anon
 * tocar órdenes en estado `draft`). `SUPABASE_SERVICE_ROLE_KEY` jamás debe ser
 * NEXT_PUBLIC ni usarse en el cliente.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
	throw new Error(
		"Missing Supabase admin env variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
	)
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
	auth: { persistSession: false, autoRefreshToken: false },
})
