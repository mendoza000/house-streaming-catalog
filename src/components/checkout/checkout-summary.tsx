"use client"

import Image from "next/image"
import { ShoppingCart, Users, Calendar } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { useCurrencyStore } from "@/stores/currency-store"
import { useExchangeRate } from "@/hooks/exchange-rate/use-exchange-rate"
import { formatPrice, convertPrice } from "@/utils/currency"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function CheckoutSummary() {
	const cartItems = useCartStore((state) => state.items)
	const getTotalPrice = useCartStore((state) => state.getTotalPrice)
	const currency = useCurrencyStore((state) => state.currency)
	const { data: exchangeRate } = useExchangeRate()

	const baseTotalPrice = getTotalPrice()
	const total = convertPrice(baseTotalPrice, currency, exchangeRate)

	if (cartItems.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<div className="rounded-full bg-muted p-6 mb-4">
						<ShoppingCart className="size-12 text-muted-foreground" />
					</div>
					<h3 className="font-semibold text-lg">Tu carrito está vacío</h3>
					<p className="text-sm text-muted-foreground mt-2">
						Agrega productos para continuar
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="flex flex-col md:max-h-[70vh]">
			<CardHeader className="shrink-0">
				<CardTitle className="text-2xl">Resumen del pedido</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 overflow-y-auto">
				{/* Items List */}
				<div className="space-y-4">
					{cartItems.map((item, index) => (
						<div key={`${item.id}-${item.accounts}-${item.months}`}>
							{index > 0 && <Separator />}
							<div className="flex gap-4 pt-4">
								{/* Image */}
								<div className="relative size-16 shrink-0 rounded-md overflow-hidden bg-muted">
									{item.image ? (
										<Image
											src={item.image}
											alt={item.title}
											fill
											className="object-cover"
											sizes="64px"
										/>
									) : (
										<div className="flex items-center justify-center size-full">
											<ShoppingCart className="size-6 text-muted-foreground/50" />
										</div>
									)}
								</div>

								{/* Info */}
								<div className="flex-1 min-w-0">
									<h4 className="font-semibold text-sm line-clamp-2">
										{item.title}
									</h4>
									<div className="flex flex-wrap gap-1.5 mt-1.5">
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
											<Users className="size-3" />
											{item.accounts}
										</span>
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
											<Calendar className="size-3" />
											{item.months}m
										</span>
										<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
											x{item.quantity}
										</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{formatPrice(convertPrice(item.price, currency, exchangeRate), currency)}/mes × {item.accounts} × {item.months}m
									</p>
								</div>

								{/* Price */}
								<div className="text-right">
									<p className="font-bold text-primary">
										{formatPrice(convertPrice(item.price * item.accounts * item.months * item.quantity, currency, exchangeRate), currency)}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>

			{/* Total - Sticky at bottom */}
			<CardFooter className="shrink-0 flex-col gap-3 border-t pt-4">
				<div className="flex items-center justify-between w-full">
					<span className="text-lg font-semibold">Total</span>
					<span className="text-2xl font-bold text-primary">
						{formatPrice(total, currency)}
					</span>
				</div>
			</CardFooter>
		</Card>
	)
}



