"use client"

import { CheckCircle2, Copy } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
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
	const handleCopy = (text: string, label: string) => {
		navigator.clipboard.writeText(text)
		toast.success(`${label} copiado al portapapeles`)
	}

	const hasAccounts = deliveredAccounts.length > 0

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
					<div className="space-y-4">
						<h3 className="font-semibold text-sm flex items-center gap-2">
							📦 Datos de tu{deliveredAccounts.length > 1 ? "s" : ""} cuenta
							{deliveredAccounts.length > 1 ? "s" : ""}:
						</h3>

						{deliveredAccounts.map((account, index) => (
							<div
								key={`${account.mail}-${account.screen}-${index}`}
								className="rounded-lg bg-background p-4 shadow-sm border space-y-3"
							>
								{account.service && (
									<p className="text-sm font-semibold">
										{account.service}{" "}
										<span className="font-normal text-muted-foreground">
											· Pantalla {account.screen}
										</span>
									</p>
								)}

								<div className="space-y-3 text-sm">
									{account.mail && (
										<div className="flex items-center justify-between p-2 rounded bg-muted/50">
											<span className="text-muted-foreground">Email:</span>
											<div className="flex items-center gap-2">
												<span className="font-mono font-medium">
													{account.mail}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={() => handleCopy(account.mail ?? "", "Email")}
												>
													<Copy className="size-3" />
												</Button>
											</div>
										</div>
									)}

									{account.password && (
										<div className="flex items-center justify-between p-2 rounded bg-muted/50">
											<span className="text-muted-foreground">Contraseña:</span>
											<div className="flex items-center gap-2">
												<span className="font-mono font-medium">
													{account.password}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={() =>
														handleCopy(account.password ?? "", "Contraseña")
													}
												>
													<Copy className="size-3" />
												</Button>
											</div>
										</div>
									)}
								</div>
							</div>
						))}

						<div className="rounded-md bg-amber-500/10 p-3">
							<p className="text-xs text-amber-600 dark:text-amber-400">
								⚠️ Guardá estos datos en un lugar seguro. Ante cualquier problema
								con tu cuenta, escribinos.
							</p>
						</div>
					</div>
				) : (
					<div className="rounded-lg border bg-background p-4">
						<p className="text-sm text-muted-foreground">
							Recibimos tu pago. Estamos preparando tu cuenta y te la enviamos a
							la brevedad. Si tarda, escribinos con tu número de orden{" "}
							<span className="font-mono font-medium text-foreground">
								#{orderInfo.id}
							</span>
							.
						</p>
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
