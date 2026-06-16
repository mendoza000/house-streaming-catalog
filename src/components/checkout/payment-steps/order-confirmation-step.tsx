"use client"

import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { DeliveredAccountsCard } from "@/components/orden/delivered-accounts-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DeliveredAccount } from "@/types/delivery"
import type { OrderInfo } from "@/types/order-types"

interface OrderConfirmationStepProps {
	orderInfo: OrderInfo
	/** Pantallas entregadas. Vacío = pago OK pero entrega pendiente. */
	deliveredAccounts?: DeliveredAccount[]
}

export function OrderConfirmationStep({
	orderInfo,
	deliveredAccounts = [],
}: OrderConfirmationStepProps) {
	const hasAccounts = deliveredAccounts.length > 0
	const trackingHref = orderInfo.trackingToken
		? `/orden/${orderInfo.trackingToken}`
		: null

	return (
		<Card className="border-primary/20 bg-primary/5">
			<CardHeader className="text-center pb-2">
				<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20">
					<CheckCircle2 className="size-8 text-primary" />
				</div>
				<CardTitle className="text-2xl text-primary">¡Pago Completado!</CardTitle>
				<p className="text-muted-foreground">
					Tu orden #{orderInfo.id} ha sido procesada exitosamente
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{hasAccounts ? (
					<DeliveredAccountsCard accounts={deliveredAccounts} />
				) : (
					<div className="rounded-lg border bg-background p-4">
						<p className="text-sm text-muted-foreground">
							Recibimos tu pago. Estamos preparando tu cuenta y te la enviamos a
							la brevedad.{" "}
							{trackingHref
								? "Podés seguir el estado de tu orden y recuperar tus credenciales desde el link de abajo en cualquier momento."
								: "Si tarda, escribinos con tu número de orden."}{" "}
							<span className="font-mono font-medium text-foreground">
								#{orderInfo.id}
							</span>
							.
						</p>
					</div>
				)}

				{trackingHref && (
					<div className="rounded-md bg-muted/50 p-3 text-center">
						<p className="text-xs text-muted-foreground mb-2">
							Guardá este link para ver tu orden y credenciales cuando quieras:
						</p>
						<Link
							href={trackingHref}
							className="text-sm font-medium text-primary underline underline-offset-4 break-all"
						>
							Ver el seguimiento de tu orden
						</Link>
					</div>
				)}

				<div className="flex justify-center pt-2">
					<Link href="/">
						<Button size="lg" className="w-full sm:w-auto">
							Ir al inicio
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}
