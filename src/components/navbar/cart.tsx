"use client"

import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { makeWhatsappLink } from "@/utils/makeWhatsappLink"
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer"
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { useCartStore } from "@/stores/cart-store"

export function Cart() {
	const [isDesktop, setIsDesktop] = useState(false)
	const [mounted, setMounted] = useState(false)

	// Store de Zustand
	const cartItems = useCartStore((state) => state.items)
	const removeItem = useCartStore((state) => state.removeItem)
	const updateQuantity = useCartStore((state) => state.updateQuantity)
	const getTotalItems = useCartStore((state) => state.getTotalItems)
	const getTotalPrice = useCartStore((state) => state.getTotalPrice)

	const itemCount = getTotalItems()
	const total = getTotalPrice()

	const handleCheckout = () => {
		const whatsappLink = makeWhatsappLink({ items: cartItems })
		window.open(whatsappLink, "_blank")
	}

	useEffect(() => {
		setMounted(true)

		const checkIsDesktop = () => {
			setIsDesktop(window.matchMedia("(min-width: 768px)").matches)
		}

		// Check inicial
		checkIsDesktop()

		// Listener para cambios de tamaño
		const mediaQuery = window.matchMedia("(min-width: 768px)")
		mediaQuery.addEventListener("change", checkIsDesktop)

		return () => mediaQuery.removeEventListener("change", checkIsDesktop)
	}, [])

	// Evitar hydration mismatch
	if (!mounted) {
		return (
			<Button size="icon" variant="outline" disabled aria-hidden="true">
				<ShoppingCart className="size-5" />
			</Button>
		)
	}

	const CartButton = (
		<Button
			size="icon"
			variant="outline"
			className="relative"
			aria-label={`Carrito - ${itemCount} artículos`}
		>
			<ShoppingCart className="size-5" />
			{itemCount > 0 && (
				<span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-bold shadow-lg animate-in zoom-in-50 duration-200">
					{itemCount > 99 ? "99+" : itemCount}
				</span>
			)}
		</Button>
	)

	const CartContent = (
		<div className="space-y-3">
			{cartItems.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="rounded-full bg-muted p-6 mb-4">
						<ShoppingCart className="size-12 text-muted-foreground" />
					</div>
					<h3 className="font-semibold text-lg mb-2">Tu carrito está vacío</h3>
					<p className="text-muted-foreground text-sm">
						Agrega productos para comenzar tu compra
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{cartItems.map((item) => (
						<div
							key={item.id}
							className="group relative flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
						>
							{/* Imagen placeholder */}
							<div className="shrink-0 rounded-md bg-muted flex items-center justify-center size-20 overflow-hidden">
								{item.image ? (
									<Image
										src={item.image}
										alt={item.title}
										width={80}
										height={80}
										className="size-full object-cover"
									/>
								) : (
									<ShoppingCart className="size-8 text-muted-foreground/50" />
								)}
							</div>

							{/* Información del producto */}
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2 mb-2">
									<h3 className="font-semibold text-base line-clamp-2">
										{item.title}
									</h3>
									<Button
										size="icon"
										variant="ghost"
										className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
										aria-label={`Eliminar ${item.title}`}
										onClick={() => removeItem(item.id)}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>

								{/* Controles de cantidad */}
								<div className="flex items-center gap-2 mb-2">
									<Button
										size="icon"
										variant="outline"
										className="size-7 rounded-full"
										onClick={() => updateQuantity(item.id, item.quantity - 1)}
										aria-label="Disminuir cantidad"
									>
										<Minus className="size-3" />
									</Button>
									<span className="text-sm font-semibold min-w-8 text-center">
										{item.quantity}
									</span>
									<Button
										size="icon"
										variant="outline"
										className="size-7 rounded-full"
										onClick={() => updateQuantity(item.id, item.quantity + 1)}
										aria-label="Aumentar cantidad"
									>
										<Plus className="size-3" />
									</Button>
								</div>

								<p className="text-lg font-bold text-primary">
									${(item.price * item.quantity).toFixed(2)}
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)

	// Drawer para móvil
	if (!isDesktop) {
		return (
			<Drawer>
				<DrawerTrigger asChild>{CartButton}</DrawerTrigger>
				<DrawerContent>
					<div className="mx-auto w-full max-w-sm flex flex-col max-h-160">
						<DrawerHeader>
							<DrawerTitle>Carrito de compras</DrawerTitle>
							<DrawerDescription>
								{itemCount === 0
									? "Tu carrito está vacío"
									: `${itemCount} ${
											itemCount === 1 ? "artículo" : "artículos"
									  } en tu carrito`}
							</DrawerDescription>
						</DrawerHeader>

						<div className="p-4 pb-0 overflow-y-auto flex-1">{CartContent}</div>

						<DrawerFooter>
							{cartItems.length > 0 && (
								<div className="flex items-center justify-between mb-4 text-lg font-bold">
									<span>Total:</span>
									<span>${total.toFixed(2)}</span>
								</div>
							)}
							<Button
								className="w-full"
								disabled={cartItems.length === 0}
								onClick={handleCheckout}
							>
								Proceder al pago
							</Button>
							<DrawerClose asChild>
								<Button variant="outline" className="w-full">
									Cerrar
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</div>
				</DrawerContent>
			</Drawer>
		)
	}

	// Sheet para desktop
	return (
		<Sheet>
			<SheetTrigger asChild>{CartButton}</SheetTrigger>
			<SheetContent className="flex flex-col">
				<SheetHeader>
					<SheetTitle className="text-2xl">Carrito de compras</SheetTitle>
					<SheetDescription>
						{itemCount === 0
							? "Tu carrito está vacío"
							: `${itemCount} ${
									itemCount === 1 ? "artículo" : "artículos"
							  } en tu carrito`}
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto px-4 py-4">{CartContent}</div>

				<SheetFooter className="flex-col gap-3 border-t pt-4">
					{cartItems.length > 0 && (
						<div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg">
							<span className="text-lg font-semibold">Total:</span>
							<span className="text-2xl font-bold text-primary">
								${total.toFixed(2)}
							</span>
						</div>
					)}
					<Button
						className="w-full h-11 text-base"
						disabled={cartItems.length === 0}
						onClick={handleCheckout}
					>
						Proceder al pago
					</Button>
					<SheetClose asChild>
						<Button variant="outline" className="w-full">
							Continuar comprando
						</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
