import type { CartItem } from "@/stores/cart-store"

interface MakeWhatsappLinkParams {
	items: CartItem[]
	phoneNumber?: string
}

export function makeWhatsappLink({
	items,
	phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
}: MakeWhatsappLinkParams): string {
	// Crear el mensaje con los productos
	let message = "¡Hola! Me gustaría solicitar los siguientes productos:\n\n"

	items.forEach((item, index) => {
		message += `${index + 1}. ${item.title}\n`
		message += `   Cantidad: ${item.quantity}\n`
		message += `   Precio unitario: $${item.price.toFixed(2)}\n`
		message += `   Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`
	})

	// Calcular el total
	const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

	message += `*Total: $${total.toFixed(2)}*\n\n`
	message += "Gracias."

	// Codificar el mensaje para URL
	const encodedMessage = encodeURIComponent(message)

	// Construir el link de WhatsApp
	// Formato: https://wa.me/{número}?text={mensaje}
	return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}
