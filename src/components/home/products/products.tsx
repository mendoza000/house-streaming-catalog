"use client"

import { useMemo, useState } from "react"
import { useCartStore } from "@/stores/cart-store"
import { useCurrencyStore } from "@/stores/currency-store"
import { useServices } from "@/hooks/services/use-services"
import { useServiceStock } from "@/hooks/services/use-service-stock"
import { useExchangeRate } from "@/hooks/exchange-rate/use-exchange-rate"
import { SearchBar } from "./search-bar"
import { CategoryFilter } from "./category-filter"
import { CurrencySelector } from "./currency-selector"
import { ProductCard } from "./product-card"

export default function Products() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
	const addItem = useCartStore((state) => state.addItem)
	const currency = useCurrencyStore((state) => state.currency)

	const { data: services, isLoading, error } = useServices()
	const { data: stock } = useServiceStock()
	const { data: exchangeRate } = useExchangeRate()

	const filteredProducts = useMemo(() => {
		if (!services) return []

		return services
			.map((service) => {
				// Store base price in USD for cart
				const basePrice = service.screen_price
				// Convert price for display if VES is selected and exchange rate is available
				const displayPrice =
					currency === "VES" && exchangeRate
						? basePrice * exchangeRate
						: basePrice

				return {
					id: service.id.toString(),
					name: service.comercial_name,
					basePrice, // Price in USD for cart storage
					price: displayPrice, // Price for display (converted if needed)
					description: service.description,
					category: service.category ?? "Otros",
					image: service.img,
					byRequest: service.is_by_request,
					// Los bajo pedido no exponen stock (se consulta al admin).
					available: service.is_by_request ? undefined : stock?.[service.id],
				}
			})
			.filter((product) => {
				const matchesSearch = product.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase())
				const matchesCategory =
					selectedCategory === "Todos" || product.category === selectedCategory

				return matchesSearch && matchesCategory
			})
	}, [searchQuery, selectedCategory, services, currency, exchangeRate, stock])

	// Categorías reales presentes en los servicios (+ "Todos").
	const categories = useMemo(() => {
		const set = new Set<string>()
		for (const service of services ?? []) {
			set.add(service.category ?? "Otros")
		}
		return ["Todos", ...Array.from(set).sort()]
	}, [services])

	const handleAddToCart = (
		product: (typeof filteredProducts)[0],
		accounts: number,
		months: number,
	) => {
		addItem({
			id: product.id,
			title: product.name,
			price: product.basePrice ?? product.price, // Use basePrice if available, fallback to display price
			image: product.image,
			accounts,
			months,
		})
	}

	if (isLoading) {
		return (
			<section className="container mx-auto px-4 py-12">
				<div className="mb-8 space-y-6">
					<h2 className="text-3xl font-bold tracking-tight">
						Nuestros Productos
					</h2>
					<div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
						<p className="text-xl font-semibold text-muted-foreground">
							Cargando servicios...
						</p>
					</div>
				</div>
			</section>
		)
	}

	if (error) {
		return (
			<section className="container mx-auto px-4 py-12">
				<div className="mb-8 space-y-6">
					<h2 className="text-3xl font-bold tracking-tight">
						Nuestros Productos
					</h2>
					<div className="flex min-h-[400px] items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10">
						<div className="text-center">
							<p className="text-xl font-semibold text-destructive">
								Error al cargar servicios
							</p>
							<p className="mt-2 text-sm text-muted-foreground">
								{error instanceof Error ? error.message : "Error desconocido"}
							</p>
						</div>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section className="container mx-auto px-4 py-12">
			<div className="mb-8 space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<h2 className="text-3xl font-bold tracking-tight">
						Nuestros Productos
					</h2>
					<SearchBar value={searchQuery} onChange={setSearchQuery} />
				</div>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="w-full overflow-x-auto sm:w-auto">
						<CategoryFilter
							categories={categories}
							selectedCategory={selectedCategory}
							onCategoryChange={setSelectedCategory}
						/>
					</div>
					<CurrencySelector />
				</div>
			</div>

			{filteredProducts.length === 0 ? (
				<div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
					<div className="text-center">
						<p className="text-xl font-semibold text-muted-foreground">
							No se encontraron productos
						</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Intenta con otra búsqueda o categoría
						</p>
					</div>
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredProducts.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							onAddToCart={handleAddToCart}
						/>
					))}
				</div>
			)}

			<div className="mt-8 text-center text-sm text-muted-foreground">
				Mostrando {filteredProducts.length} de {services?.length ?? 0} productos
			</div>
		</section>
	)
}
