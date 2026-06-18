import { PROVIDER_PRODUCT_TO_SERVICE_ID } from "@/constants/provider-stock";

/**
 * Cliente SERVER-ONLY del stock del proveedor.
 *
 * Consulta la Supabase del proveedor (distinta de la nuestra) y cuenta las
 * cuentas disponibles por producto. `PROVIDER_SUPABASE_URL` y
 * `PROVIDER_SUPABASE_ANON_KEY` jamás deben ser NEXT_PUBLIC: la key se queda en
 * el server para no exponer al proveedor en el bundle.
 *
 * Sigue el patrón result-tuple del proyecto: nunca lanza, devuelve { data, error }.
 */

interface ProviderAccountRow {
	product_id: number | null;
}

/**
 * Devuelve un mapa { serviceId local: stock } listo para mergear en el catálogo.
 * Solo incluye los productos presentes en `PROVIDER_PRODUCT_TO_SERVICE_ID`; un
 * producto mapeado sin cuentas queda en 0.
 */
export async function fetchProviderStock(): Promise<{
	data: Record<number, number> | null;
	error: Error | null;
}> {
	const url = process.env.PROVIDER_SUPABASE_URL;
	const key = process.env.PROVIDER_SUPABASE_ANON_KEY;

	if (!url || !key) {
		return {
			data: null,
			error: new Error(
				"Provider stock no configurado: PROVIDER_SUPABASE_URL y PROVIDER_SUPABASE_ANON_KEY son requeridas",
			),
		};
	}

	try {
		// Solo cuentas con status `disponible`: la tabla del proveedor también
		// guarda las `vendido`, que NO son stock. Sin este filtro el conteo se
		// infla (ej. Paramount: 17 totales = 9 disponibles + 8 vendidas).
		const response = await fetch(
			`${url}/rest/v1/accounts?select=product_id&status=eq.disponible`,
			{
				headers: { apikey: key, Authorization: `Bearer ${key}` },
				cache: "no-store",
			},
		);

		if (!response.ok) {
			return {
				data: null,
				error: new Error(`Provider API error (status ${response.status})`),
			};
		}

		const rows = (await response.json()) as ProviderAccountRow[];

		// Conteo de cuentas por product_id = stock disponible (lógica del script).
		const countByProduct: Record<number, number> = {};
		for (const row of rows) {
			if (row.product_id == null) continue;
			countByProduct[row.product_id] =
				(countByProduct[row.product_id] ?? 0) + 1;
		}

		// Remapear al id local del servicio. Los product_id fuera del mapa se
		// ignoran; los mapeados sin cuentas quedan en 0 (→ "Agotado").
		const stock: Record<number, number> = {};
		for (const [productId, serviceId] of Object.entries(
			PROVIDER_PRODUCT_TO_SERVICE_ID,
		)) {
			stock[serviceId] = countByProduct[Number(productId)] ?? 0;
		}

		return { data: stock, error: null };
	} catch (error) {
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to fetch provider stock"),
		};
	}
}
