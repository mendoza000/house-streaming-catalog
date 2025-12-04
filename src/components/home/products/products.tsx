"use client"

import { useState, useMemo } from "react"
import { mockProducts, type Category } from "@/constants/products"
import { useCartStore } from "@/stores/cart-store"
import { SearchBar } from "./search-bar"
import { CategoryFilter } from "./category-filter"
import { ProductCard } from "./product-card"

export default function Products() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState<Category>("Todos")
	const addItem = useCartStore((state) => state.addItem)

	const filteredProducts = useMemo(() => {
		return mockProducts.filter((product) => {
			const matchesSearch = product.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase())
			const matchesCategory =
				selectedCategory === "Todos" || product.category === selectedCategory

			return matchesSearch && matchesCategory
		})
	}, [searchQuery, selectedCategory])

	const handleAddToCart = (product: (typeof mockProducts)[0]) => {
		addItem({
			id: product.id,
			title: product.name,
			price: product.price,
			image: product.image,
		})
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

				<CategoryFilter
					selectedCategory={selectedCategory}
					onCategoryChange={setSelectedCategory}
				/>
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
				Mostrando {filteredProducts.length} de {mockProducts.length} productos
			</div>
		</section>
	)
}
