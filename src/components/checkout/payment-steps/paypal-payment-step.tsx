"use client"

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DeliveredAccount } from "@/types/delivery"

interface PayPalPaymentStepProps {
	orderId: number
	amount: number
	currency?: string
	onSuccess: (delivered: DeliveredAccount[]) => void
	onError: (error: unknown) => void
	onBack: () => void
}

export function PayPalPaymentStep({
	orderId,
	amount,
	currency = "USD",
	onSuccess,
	onError,
	onBack,
}: PayPalPaymentStepProps) {
	const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""

	if (!clientId) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-destructive">
						Error: PayPal Client ID no configurado
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<PayPalScriptProvider
			options={{
				clientId,
				currency,
				intent: "capture",
				components: "buttons",
				"disable-funding": "card,credit",
			}}
		>
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Pago con PayPal</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* PayPal Buttons */}
					<div className="rounded-lg border border-border p-4">
						<p className="mb-4 text-sm text-muted-foreground">
							Monto a pagar: ${amount.toFixed(2)} {currency}
						</p>
						<div className="paypal-buttons-container">
							<PayPalButtons
								style={{
									layout: "vertical",
									shape: "rect",
									label: "paypal",
									color: "gold",
									tagline: false,
								}}
								fundingSource="paypal"
								createOrder={async () => {
									// El monto lo fija el server desde la orden en DB; el
									// cliente solo manda el id. Sin fallback client-side: dejaría
									// el monto en manos del browser.
									const response = await fetch("/api/paypal/create-order", {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({ orderId }),
									})

									if (!response.ok) {
										throw new Error("Failed to create order")
									}

									const order = await response.json()
									return order.id
								}}
								onApprove={async (data) => {
									// La captura + completar orden + entrega ocurren server-side
									// (service-role). Sin fallback: la captura client-side
									// dejaría la orden sin completar y la cuenta sin entregar.
									const response = await fetch("/api/paypal/capture-order", {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({
											paypalOrderId: data.orderID,
											orderId,
										}),
									})

									if (!response.ok) {
										const error = await response.json().catch(() => ({}))
										onError(error)
										return
									}

									const result = await response.json()
									onSuccess(result.delivered ?? [])
								}}
								onError={(err) => {
									console.error("PayPal error:", err)
									onError(err)
								}}
							/>
						</div>
					</div>

					{/* Info */}
					<div className="rounded-lg bg-muted p-4">
						<p className="text-sm text-muted-foreground">
							Serás redirigido a PayPal para completar tu pago de forma segura.
							Una vez completado, volverás automáticamente a esta página.
						</p>
					</div>

					{/* Back Button */}
					<Button variant="outline" onClick={onBack} className="w-full">
						Volver a seleccionar método
					</Button>
				</CardContent>
			</Card>
		</PayPalScriptProvider>
	)
}
