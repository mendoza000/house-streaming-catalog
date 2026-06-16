"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddToCartModal } from "./add-to-cart-modal"
import type { Product } from "@/constants/products"
import { useCurrencyStore } from "@/stores/currency-store"
import { formatPrice } from "@/utils/currency"

interface ProductCardProps {
	product: Product
	onAddToCart?: (product: Product, accounts: number, months: number) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const currency = useCurrencyStore((state) => state.currency)

	// Bajo pedido: no se gestiona stock, se consulta al admin antes de pagar.
	const isByRequest = product.byRequest === true
	// available undefined = todavía sin dato de stock (no bloqueamos).
	const hasStockData = !isByRequest && product.available !== undefined
	const isSoldOut = hasStockData && (product.available ?? 0) <= 0

	const handleConfirm = (accounts: number, months: number) => {
		onAddToCart?.(product, accounts, months)
	}

	return (
		<>
			<Card className="group flex h-full flex-col overflow-hidden pt-0 transition-all hover:shadow-lg">
				<div className="relative aspect-video w-full overflow-hidden bg-muted">
					{product.image ? (
						<Image
							src={product.image}
							alt={product.name}
							fill
							className="object-cover transition-transform duration-300 group-hover:scale-105"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						/>
					) : (
						<div className="flex size-full items-center justify-center">
							<ShoppingCart className="size-10 text-muted-foreground/40" />
						</div>
					)}
				</div>
				<CardHeader className="grow">
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="line-clamp-1">{product.name}</CardTitle>
						<Badge variant="secondary">{product.category}</Badge>
					</div>
					<CardDescription className="line-clamp-2">
						{product.description}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<p className="text-2xl font-bold">
						{formatPrice(product.price, currency)}
						<span className="text-sm font-normal text-muted-foreground">
							/mes
						</span>
					</p>
					{isByRequest ? (
						<Badge variant="secondary">Bajo pedido</Badge>
					) : (
						hasStockData &&
						(isSoldOut ? (
							<Badge variant="destructive">Agotado</Badge>
						) : (
							<Badge variant="outline">
								{product.available} disponible{product.available === 1 ? "" : "s"}
							</Badge>
						))
					)}
				</CardContent>
				<CardFooter className="mt-auto">
					<Button
						className="w-full"
						onClick={() => setIsModalOpen(true)}
						disabled={isSoldOut}
					>
						<ShoppingCart className="mr-2 h-4 w-4" />
						{isSoldOut ? "Agotado" : "Agregar al carrito"}
					</Button>
				</CardFooter>
			</Card>

			<AddToCartModal
				product={product}
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				onConfirm={handleConfirm}
			/>
		</>
	)
}
