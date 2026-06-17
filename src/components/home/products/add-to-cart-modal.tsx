"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Users, Calendar } from "lucide-react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Product } from "@/constants/products"

interface AddToCartModalProps {
	product: Product
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (accounts: number, months: number) => void
}

const MONTHS_OPTIONS = [1, 2, 3, 6] as const

export function AddToCartModal({
	product,
	open,
	onOpenChange,
	onConfirm,
}: AddToCartModalProps) {
	const [accountsInput, setAccountsInput] = useState("1")
	const [months, setMonths] = useState<number>(1)

	const accounts = Number.parseInt(accountsInput, 10) || 0
	const maxAccounts = product.available // undefined = sin límite conocido
	const exceedsStock = maxAccounts !== undefined && accounts > maxAccounts
	const isAccountsValid = accounts >= 1 && !exceedsStock

	const handleConfirm = () => {
		if (!isAccountsValid) return

		onConfirm(accounts, months)
		onOpenChange(false)
		// Reset to defaults
		setAccountsInput("1")
		setMonths(1)
	}

	const subtotal = isAccountsValid ? product.price * accounts * months : 0

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">
						Configurar producto
					</DialogTitle>
					<DialogDescription>
						Personaliza tu suscripción antes de agregar al carrito
					</DialogDescription>
				</DialogHeader>

				{/* Product Info */}
				<div className="flex gap-4 rounded-lg border bg-muted/30 p-4">
					<div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md">
						<Image
							src={product.image}
							alt={product.name}
							fill
							className="object-cover"
							sizes="96px"
						/>
					</div>
					<div className="flex flex-col justify-center">
						<h3 className="font-semibold leading-tight">{product.name}</h3>
						<p className="text-sm text-muted-foreground line-clamp-2">
							{product.description}
						</p>
						<p className="mt-1 text-lg font-bold text-primary">
							${product.price.toFixed(2)}
							<span className="text-xs font-normal text-muted-foreground">
								/mes
							</span>
						</p>
					</div>
				</div>

				{/* Configuration */}
				<div className="space-y-6 py-2">
					{/* Accounts */}
					<div className="space-y-3">
						<label
							htmlFor="accounts-input"
							className="flex items-center gap-2 text-sm font-medium"
						>
							<Users className="h-4 w-4 text-primary" />
							Número de cuentas
						</label>
						<Input
							id="accounts-input"
							type="number"
							min={1}
							max={maxAccounts}
							value={accountsInput}
							onChange={(e) => setAccountsInput(e.target.value)}
							className={`text-base ${!isAccountsValid && accountsInput !== "" ? "border-red-500" : ""}`}
						/>
						{accounts < 1 && accountsInput !== "" && (
							<p className="text-xs text-red-500">
								La cantidad debe ser al menos 1
							</p>
						)}
						{exceedsStock && (
							<p className="text-xs text-red-500">
								Solo hay {maxAccounts} pantalla{maxAccounts === 1 ? "" : "s"}{" "}
								disponible{maxAccounts === 1 ? "" : "s"}
							</p>
						)}
						{accountsInput === "" && (
							<p className="text-xs text-muted-foreground">
								Ingresa la cantidad de cuentas
							</p>
						)}
						{isAccountsValid && (
							<p className="text-xs text-muted-foreground">
								Cantidad de cuentas que deseas adquirir
							</p>
						)}
					</div>

					{/* Months */}
					<div className="space-y-3">
						<span className="flex items-center gap-2 text-sm font-medium">
							<Calendar className="h-4 w-4 text-primary" />
							Duración de suscripción
						</span>
						<div className="grid grid-cols-4 gap-2">
							{MONTHS_OPTIONS.map((monthOption) => (
								<Button
									key={monthOption}
									variant={months === monthOption ? "default" : "outline"}
									onClick={() => setMonths(monthOption)}
									className="relative h-auto flex-col gap-1 py-3 transition-all hover:scale-105"
								>
									<span className="text-2xl font-bold">{monthOption}</span>
									<span className="text-xs">
										{monthOption === 1 ? "mes" : "meses"}
									</span>
									{monthOption === 6 && (
										<span className="absolute -top-2 -right-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg">
											Popular
										</span>
									)}
								</Button>
							))}
						</div>
						<p className="text-xs text-muted-foreground">
							Selecciona la duración de tu suscripción
						</p>
					</div>

					{/* Pricing Summary */}
					<div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Precio base</span>
								<span className="font-medium">
									${product.price.toFixed(2)}/mes
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Cuentas</span>
								<span className="font-medium">× {accounts}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Duración</span>
								<span className="font-medium">
									× {months} {months === 1 ? "mes" : "meses"}
								</span>
							</div>
							<div className="border-t border-primary/20 pt-2">
								<div className="flex items-baseline justify-between">
									<span className="font-semibold">Total</span>
									<div className="text-right">
										<div className="text-3xl font-bold text-primary">
											${subtotal.toFixed(2)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancelar
					</Button>
					<Button
						type="button"
						onClick={handleConfirm}
						className="gap-2"
						disabled={!isAccountsValid}
					>
						<ShoppingCart className="h-4 w-4" />
						Agregar al carrito
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
