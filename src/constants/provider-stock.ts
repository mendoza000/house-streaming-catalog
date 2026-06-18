/**
 * Stock de productos "bajo pedido" servido desde la Supabase del PROVEEDOR.
 *
 * El proveedor expone una tabla `accounts` con `product_id`; la cantidad de
 * filas por `product_id` es el stock disponible. Mapeamos cada `product_id` del
 * proveedor al `id` del servicio en NUESTRA base.
 *
 * Ojo: el `product_id` del proveedor y el `id` local NO coinciden — son bases
 * distintas. El mapeo es explícito y verificado contra la tabla `services`.
 */
export const PROVIDER_PRODUCT_TO_SERVICE_ID: Record<number, number> = {
	2: 5, // Spotify Premium      → Spotify
	5: 14, // Deezer Premium       → Deezer
	7: 7, // Crunchyroll          → Crunchyroll
	8: 18, // Surfshark VPN        → Surfshark VPN
	9: 13, // Tidal                → Tidal
	11: 15, // Capcut Pro Renovable → Capcut Pro (id 15, NO el 10 "Capcut Estandar")
	18: 12, // Paramount Plus       → Paramount
};
