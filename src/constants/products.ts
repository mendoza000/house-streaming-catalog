export type Product = {
	id: string
	name: string
	price: number
	description: string
	category: string
	image: string
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

export const mockProducts: Product[] = [
	{
		id: "1",
		name: "Netflix Premium",
		price: 15.99,
		description: "Plan premium con 4 pantallas simultáneas y contenido 4K UHD",
		category: "Streaming",
		image:
			"https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop",
	},
	{
		id: "2",
		name: "Spotify Premium",
		price: 9.99,
		description: "Música sin límites, sin anuncios y modo offline",
		category: "Música",
		image:
			"https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=300&fit=crop",
	},
	{
		id: "3",
		name: "Disney Plus",
		price: 8.99,
		description:
			"Todo el contenido de Disney, Pixar, Marvel, Star Wars y National Geographic",
		category: "Streaming",
		image:
			"https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=300&fit=crop",
	},
	{
		id: "4",
		name: "Xbox Game Pass Ultimate",
		price: 14.99,
		description:
			"Acceso a más de 100 juegos de alta calidad en consola, PC y nube",
		category: "Gaming",
		image:
			"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
	},
	{
		id: "5",
		name: "Adobe Creative Cloud",
		price: 54.99,
		description:
			"Suite completa de aplicaciones creativas incluyendo Photoshop, Illustrator y más",
		category: "Productividad",
		image:
			"https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop",
	},
	{
		id: "6",
		name: "NordVPN",
		price: 11.99,
		description: "VPN segura y rápida con servidores en más de 60 países",
		category: "VPN",
		image:
			"https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=300&fit=crop",
	},
	{
		id: "7",
		name: "HBO Max",
		price: 9.99,
		description: "Películas, series y contenido original de Warner Bros",
		category: "Streaming",
		image:
			"https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=300&fit=crop",
	},
	{
		id: "8",
		name: "YouTube Premium",
		price: 11.99,
		description:
			"YouTube sin anuncios, reproducción en segundo plano y YouTube Music",
		category: "Streaming",
		image:
			"https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop",
	},
	{
		id: "9",
		name: "PlayStation Plus",
		price: 9.99,
		description:
			"Juegos online, juegos mensuales gratuitos y descuentos exclusivos",
		category: "Gaming",
		image:
			"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
	},
	{
		id: "10",
		name: "Microsoft 365",
		price: 6.99,
		description: "Word, Excel, PowerPoint y 1TB de almacenamiento en OneDrive",
		category: "Productividad",
		image:
			"https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400&h=300&fit=crop",
	},
	{
		id: "11",
		name: "Amazon Prime Video",
		price: 8.99,
		description: "Películas, series y contenido original de Amazon Studios",
		category: "Streaming",
		image:
			"https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&h=300&fit=crop",
	},
	{
		id: "12",
		name: "Apple Music",
		price: 10.99,
		description:
			"Más de 100 millones de canciones con audio espacial y sin pérdida",
		category: "Música",
		image:
			"https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=300&fit=crop",
	},
]
