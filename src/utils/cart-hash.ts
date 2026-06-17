import type { CartItem } from "@/stores/cart-store";

/**
 * Genera un hash único basado en el contenido del carrito
 * Se usa para identificar órdenes draft con el mismo carrito
 * @param items - Items del carrito
 * @returns Hash string único del carrito
 */
export function generateCartHash(items: CartItem[]): string {
	// Crear string único de cada item ordenado
	const cartString = items
		.map(
			(item) => `${item.id}-${item.accounts}-${item.months}-${item.quantity}`,
		)
		.sort()
		.join("|");

	// Generar hash simple con btoa (base64)
	// En producción podrías usar crypto.subtle.digest para SHA-256
	try {
		return btoa(cartString).substring(0, 32);
	} catch {
		// Fallback si btoa falla (caracteres especiales)
		return cartString
			.split("")
			.reduce((acc, char) => {
				return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
			}, 0)
			.toString(36)
			.substring(0, 32);
	}
}
