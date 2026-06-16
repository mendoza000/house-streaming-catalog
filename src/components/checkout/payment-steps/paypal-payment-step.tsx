"use client"

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PayPalPaymentStepProps {
	amount: number
	currency?: string
	onSuccess: (details: unknown) => void
	onError: (error: unknown) => void
	onBack: () => void
}

export function PayPalPaymentStep({
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
								createOrder={async (_data, actions) => {
									try {
										const response = await fetch("/api/paypal/create-order", {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ amount, currency }),
										})

										if (!response.ok) {
											throw new Error("Failed to create order")
										}

										const order = await response.json()
										return order.id
									} catch (error) {
										console.error(
											"API create order failed, using fallback:",
											error,
										)
										// Fallback to client-side order creation
										return actions.order.create({
											intent: "CAPTURE",
											purchase_units: [
												{
													amount: {
														currency_code: currency,
														value: amount.toFixed(2),
													},
												},
											],
										})
									}
								}}
								onApprove={async (_data, actions) => {
									try {
										// Try to capture via API route first
										const response = await fetch("/api/paypal/capture-order", {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ orderId: _data.orderID }),
										})

										if (response.ok) {
											const details = await response.json()
											onSuccess(details)
											return
										}
									} catch {
										// Fallback to client-side capture
									}

									// Client-side capture fallback
									if (actions.order) {
										const details = await actions.order.capture()
										onSuccess(details)
									}
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
