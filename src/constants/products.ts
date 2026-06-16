export type Product = {
	id: string
	name: string
	price: number
	basePrice: number // Base price in USD (for cart storage when using currency conversion)
	description: string
	category: string
	image: string
	available?: number // Pantallas disponibles (stock). undefined = sin dato aún.
	byRequest?: boolean // Servicio bajo pedido: disponibilidad se consulta al admin.
}

export const categories = [
	"Todos",
	"Streaming",
	"Gaming",
	"Música",
	"Productividad",
	"VPN",
] as const

export type Category = (typeof categories)[number]
