"use client";

import {
	Calendar,
	Minus,
	Plus,
	ShoppingCart,
	Trash2,
	Users,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useExchangeRate } from "@/hooks/exchange-rate/use-exchange-rate";
import { useCartStore } from "@/stores/cart-store";
import { useCurrencyStore } from "@/stores/currency-store";
import { convertPrice, formatPrice } from "@/utils/currency";

export function Cart() {
	const router = useRouter();
	const pathname = usePathname();
	const [isDesktop, setIsDesktop] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	// Store de Zustand
	const cartItems = useCartStore((state) => state.items);
	const removeItem = useCartStore((state) => state.removeItem);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const getTotalItems = useCartStore((state) => state.getTotalItems);
	const getTotalPrice = useCartStore((state) => state.getTotalPrice);
	const currency = useCurrencyStore((state) => state.currency);
	const { data: exchangeRate } = useExchangeRate();

	const itemCount = getTotalItems();
	const baseTotalPrice = getTotalPrice();
	const total = convertPrice(baseTotalPrice, currency, exchangeRate);

	const handleCheckout = () => {
		setIsOpen(false); // Close drawer/sheet
		router.push("/checkout");
	};

	useEffect(() => {
		setMounted(true);

		const checkIsDesktop = () => {
			setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
		};

		// Check inicial
		checkIsDesktop();

		// Listener para cambios de tamaño
		const mediaQuery = window.matchMedia("(min-width: 768px)");
		mediaQuery.addEventListener("change", checkIsDesktop);

		return () => mediaQuery.removeEventListener("change", checkIsDesktop);
	}, []);

	// Hide cart button on checkout page
	if (pathname === "/checkout") {
		return null;
	}

	// Evitar hydration mismatch
	if (!mounted) {
		return (
			<Button size="icon" variant="outline" disabled aria-hidden="true">
				<ShoppingCart className="size-5" />
			</Button>
		);
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
	);

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
							key={`${item.id}-${item.accounts}-${item.months}`}
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
									<div className="flex-1">
										<h3 className="font-semibold text-base line-clamp-2">
											{item.title}
										</h3>
										{/* Info de configuración */}
										<div className="flex flex-wrap gap-1.5 mt-1.5">
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
												<Users className="size-3" />
												{item.accounts}{" "}
												{item.accounts === 1 ? "cuenta" : "cuentas"}
											</span>
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
												<Calendar className="size-3" />
												{item.months} {item.months === 1 ? "mes" : "meses"}
											</span>
										</div>
									</div>
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

								<div className="flex items-baseline gap-2">
									<p className="text-lg font-bold text-primary">
										{formatPrice(
											convertPrice(
												item.price *
													item.accounts *
													item.months *
													item.quantity,
												currency,
												exchangeRate,
											),
											currency,
										)}
									</p>
									<p className="text-xs text-muted-foreground">
										(
										{formatPrice(
											convertPrice(item.price, currency, exchangeRate),
											currency,
										)}
										/mes × {item.accounts} × {item.months}{" "}
										{item.months === 1 ? "mes" : "meses"})
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);

	// Drawer para móvil
	if (!isDesktop) {
		return (
			<Drawer open={isOpen} onOpenChange={setIsOpen}>
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
									<span>{formatPrice(total, currency)}</span>
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
		);
	}

	// Sheet para desktop
	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
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
								{formatPrice(total, currency)}
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
	);
}
