"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentMethodCard } from "./payment-method-card"
import { AvailabilityCheckStep } from "./payment-steps/availability-check-step"
import { BinancePaymentStep } from "./payment-steps/binance-payment-step"
import { PayPalPaymentStep } from "./payment-steps/paypal-payment-step"
import { CreditCardPaymentStep } from "./payment-steps/credit-card-payment-step"
import { PagoMovilPaymentStep } from "./payment-steps/pago-movil-payment-step"
import { OrderConfirmationStep } from "./payment-steps/order-confirmation-step"
import { PaymentValidationStep } from "./payment-steps/payment-validation-step"
import { PAYMENT_METHODS } from "@/constants/payment-methods"
import { useCartStore } from "@/stores/cart-store"
import { useCurrencyStore } from "@/stores/currency-store"
import { useCreateOrder } from "@/hooks/orders/use-create-order"
import { useFulfillOrder } from "@/hooks/orders/use-fulfill-order"
import { useServices } from "@/hooks/services/use-services"
import type { AvailabilityItem } from "@/hooks/orders/use-availability-check"
import { updateOrderStatus, updateOrderToPending } from "@/api/orders"
import type { OrderStatus, ClientFormData } from "@/types/order-types"
import type { DeliveredAccount } from "@/types/delivery"
import { Loader2, AlertCircle } from "lucide-react"

interface PaymentMethodsSectionProps {
	onStepChange?: (step: number) => void
	clientData: ClientFormData
	isClientFormValid: boolean
}

export function PaymentMethodsSection({
	onStepChange,
	clientData,
	isClientFormValid,
}: PaymentMethodsSectionProps) {
	const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
	const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
	const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending")
	const [orderId, setOrderId] = useState<number | null>(null)
	const [deliveredAccounts, setDeliveredAccounts] = useState<DeliveredAccount[]>(
		[],
	)
	// Cuando el carrito tiene servicios bajo pedido, se consulta disponibilidad
	// antes de habilitar el pago.
	const [awaitingAvailability, setAwaitingAvailability] = useState(false)
	// URL del comprobante subido (Pago Móvil), para la validación por Telegram.
	const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
	
	const cartItems = useCartStore((state) => state.items)
	const getTotalPrice = useCartStore((state) => state.getTotalPrice)
	const clearCart = useCartStore((state) => state.clearCart)
	const currency = useCurrencyStore((state) => state.currency)
	
	const { mutate: createOrderMutation, isLoading: isCreatingOrder, error: createOrderError } = useCreateOrder()
	const { fulfill } = useFulfillOrder()
	const { data: services } = useServices()

	// Ítems del carrito que son "bajo pedido" (requieren consultar disponibilidad).
	const byRequestServiceIds = new Set(
		(services ?? []).filter((s) => s.is_by_request).map((s) => s.id),
	)
	const byRequestItems: AvailabilityItem[] = cartItems
		.filter((item) => byRequestServiceIds.has(Number(item.id)))
		.map((item) => ({
			serviceId: Number(item.id),
			title: item.title,
			months: item.months,
		}))

	// Calculate total for PayPal using the store's method (includes accounts * months)
	const totalAmount = getTotalPrice()

	const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId)

	const handleContinueToStep2 = async () => {
		if (!selectedMethodId || !isClientFormValid) return

		// Crear la orden en la base de datos
		const order = await createOrderMutation({
			client_name: clientData.name,
			client_phone: clientData.phone,
			client_email: clientData.email,
			amount: totalAmount,
			payment_method: selectedMethod?.name || selectedMethodId,
			currency: currency,
			items: cartItems,
		})

		if (order) {
			setOrderId(order.id)
			onStepChange?.(2)
			// Si hay servicios bajo pedido, consultar disponibilidad antes de pagar.
			if (byRequestItems.length > 0) {
				setAwaitingAvailability(true)
			} else {
				setCurrentStep(2)
			}
		}
	}

	const handleAvailabilityConfirmed = () => {
		setAwaitingAvailability(false)
		setCurrentStep(2)
	}

	const handleAvailabilityBack = () => {
		setAwaitingAvailability(false)
		handleBackToStep1()
	}

	const handleBackToStep1 = () => {
		// No hacer nada con la orden, se mantiene en draft
		// El usuario puede volver a continuar y se reutilizará la misma orden
		setCurrentStep(1)
		onStepChange?.(1)
	}

	const handlePaymentSuccess = async () => {
		// Determine next state based on payment method type
		// If manual (like Pago Movil), go to validating state
		// If automatic (like PayPal), go directly to completed
		const nextStatus: OrderStatus =
			selectedMethod?.type === "manual" ? "validating" : "completed"

		setOrderStatus(nextStatus)
		
		// Update order status in database
		// First update draft → pending, then to final status
		if (orderId) {
			// Cambiar de draft a pending si aún está en draft
			await updateOrderToPending(orderId)

			// Luego actualizar al estado final
			await updateOrderStatus(orderId, nextStatus)

			// Si quedó pagada (automático: PayPal/tarjeta), entregar la cuenta real.
			if (nextStatus === "completed") {
				const result = await fulfill(orderId)
				setDeliveredAccounts(result?.delivered ?? [])
			}
		}

		setCurrentStep(3)
		onStepChange?.(3)

		// If completed (automatic), we clear cart immediately
		if (nextStatus === "completed") {
			clearCart()
		}
	}

	// Binance: el server ya marcó la orden `completed` Y la entregó (devuelve las
	// credenciales). Acá solo reflejamos estado + lo entregado, sin re-escribir DB.
	const handleBinanceVerified = (delivered: DeliveredAccount[]) => {
		setDeliveredAccounts(delivered)
		setOrderStatus("completed")
		setCurrentStep(3)
		onStepChange?.(3)
		clearCart()
	}

	// Pago Móvil: subió el comprobante → crear ticket de validación y pasar al
	// paso "Validando…". El admin aprueba/rechaza por Telegram.
	const handlePagoMovilSubmit = (uploadedReceiptUrl: string) => {
		// La orden se marca 'validating' server-side al crear el ticket (dentro
		// de createPaymentValidationRequest), así que acá solo cambiamos de paso.
		setReceiptUrl(uploadedReceiptUrl)
		setOrderStatus("validating")
		setCurrentStep(3)
		onStepChange?.(3)
	}

	// El admin aprobó el pago: el trigger ya completó/entregó la orden server-side.
	// Acá reflejamos las credenciales y pasamos a la confirmación.
	const handlePaymentValidationApproved = (delivered: DeliveredAccount[]) => {
		setDeliveredAccounts(delivered)
		setOrderStatus("completed")
		clearCart()
	}

	const handlePaymentError = (error: unknown) => {
		console.error("Payment error:", error)
		// TODO: Show error message to user
	}

	// Step 3: Confirmation / Validation
	if (currentStep === 3) {
		if (orderStatus === "validating" && orderId && receiptUrl) {
			const summary = `${cartItems
				.map((i) => `${i.title} x${i.quantity}`)
				.join(", ")} — Total ${totalAmount.toFixed(2)} ${currency}`
			return (
				<PaymentValidationStep
					input={{
						orderId,
						clientName: clientData.name,
						clientPhone: clientData.phone,
						receiptUrl,
						description: summary,
					}}
					onApproved={handlePaymentValidationApproved}
				/>
			)
		}

		if (orderStatus === "completed") {
			return (
				<OrderConfirmationStep
					orderInfo={{
						id: orderId?.toString() ?? "0",
						status: "completed",
						paymentMethod: selectedMethod?.name ?? "Desconocido",
						totalAmount: totalAmount,
						createdAt: new Date(),
					}}
					deliveredAccounts={deliveredAccounts}
				/>
			)
		}
	}

	// Paso intermedio: consultar disponibilidad de servicios bajo pedido.
	if (awaitingAvailability && orderId) {
		return (
			<AvailabilityCheckStep
				items={byRequestItems}
				client={{ name: clientData.name, phone: clientData.phone }}
				onAllAvailable={handleAvailabilityConfirmed}
				onBack={handleAvailabilityBack}
			/>
		)
	}

	// Step 2: Show payment-specific component
	if (currentStep === 2 && selectedMethod && orderId) {
		switch (selectedMethod.id) {
			case "binance-pay":
				return (
					<BinancePaymentStep
						method={selectedMethod}
						orderId={orderId}
						onVerify={handleBinanceVerified}
						onBack={handleBackToStep1}
					/>
				)
			case "paypal":
				return (
					<PayPalPaymentStep
						amount={totalAmount}
						onSuccess={handlePaymentSuccess}
						onError={handlePaymentError}
						onBack={handleBackToStep1}
					/>
				)
			case "credit-card":
				return (
					<CreditCardPaymentStep
						amount={totalAmount}
						onSuccess={handlePaymentSuccess}
						onError={handlePaymentError}
						onBack={handleBackToStep1}
					/>
				)
			case "pago-movil":
				return (
					<PagoMovilPaymentStep
						method={selectedMethod}
						onSubmit={handlePagoMovilSubmit}
						onBack={handleBackToStep1}
					/>
				)
			default:
				return null
		}
	}

	// Step 1: Payment method selection
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Selecciona un método de pago</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Payment Methods */}
				<div className="space-y-3">
					{PAYMENT_METHODS.map((method) => (
						<PaymentMethodCard
							key={method.id}
							method={method}
							isSelected={selectedMethodId === method.id}
							onSelect={() => setSelectedMethodId(method.id)}
						/>
					))}
				</div>

				{/* Error Message */}
				{createOrderError && (
					<div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3">
						<AlertCircle className="size-4 text-destructive shrink-0" />
						<p className="text-sm text-destructive">
							Error al crear la orden. Por favor, intenta de nuevo.
						</p>
					</div>
				)}

				{/* Continue Button */}
				<Button
					size="lg"
					className="w-full"
					disabled={
						!selectedMethodId || 
						cartItems.length === 0 || 
						!isClientFormValid || 
						isCreatingOrder
					}
					onClick={handleContinueToStep2}
				>
					{isCreatingOrder ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Creando orden...
						</>
					) : (
						"Continuar con el pago"
					)}
				</Button>

				{!selectedMethodId && cartItems.length > 0 && isClientFormValid && (
					<p className="text-center text-sm text-muted-foreground">
						Selecciona un método de pago para continuar
					</p>
				)}
				
				{!isClientFormValid && cartItems.length > 0 && (
					<p className="text-center text-sm text-muted-foreground">
						Completa tus datos para continuar
					</p>
				)}
			</CardContent>
		</Card>
	)
}
