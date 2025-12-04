"use client"

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
import type { Product } from "@/constants/products"

interface ProductCardProps {
	product: Product
	onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
	return (
		<Card className="group flex h-full flex-col overflow-hidden pt-0 transition-all hover:shadow-lg">
			<div className="relative aspect-video w-full overflow-hidden">
				<Image
					src={product.image}
					alt={product.name}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
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
			<CardContent>
				<p className="text-2xl font-bold">
					${product.price.toFixed(2)}
					<span className="text-sm font-normal text-muted-foreground">
						/mes
					</span>
				</p>
			</CardContent>
			<CardFooter className="mt-auto">
				<Button className="w-full" onClick={() => onAddToCart?.(product)}>
					<ShoppingCart className="mr-2 h-4 w-4" />
					Agregar al carrito
				</Button>
			</CardFooter>
		</Card>
	)
}
