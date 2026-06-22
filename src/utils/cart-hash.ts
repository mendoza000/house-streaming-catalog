import type { CartItem } from "@/stores/cart-store";

/**
 * Genera un hash determinístico basado en el contenido del carrito.
 * Se usa para identificar órdenes draft con el mismo carrito.
 *
 * Usa SHA-256 sobre el string completo del carrito (no se trunca), de modo que
 * dos carritos distintos nunca colisionan: la versión anterior recortaba el
 * base64 a 32 chars y carritos con el mismo prefijo terminaban con el mismo
 * hash, actualizando el draft equivocado.
 *
 * @param items - Items del carrito
 * @returns Hash hex (64 chars) único del carrito
 */
export async function generateCartHash(items: CartItem[]): Promise<string> {
	const cartString = items
		.map(
			(item) => `${item.id}-${item.accounts}-${item.months}-${item.quantity}`,
		)
		.sort()
		.join("|");

	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(cartString),
	);

	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}
