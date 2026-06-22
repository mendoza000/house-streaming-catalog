"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PAYMENT_METHODS } from "@/constants/payment-methods";
import { useExchangeRate } from "@/hooks/exchange-rate/use-exchange-rate";
import type { AvailabilityItem } from "@/hooks/orders/use-availability-check";
import { useCreateOrder } from "@/hooks/orders/use-create-order";
import { useServices } from "@/hooks/services/use-services";
import { useCartStore } from "@/stores/cart-store";
import type { DeliveredAccount } from "@/types/delivery";
import type { ClientFormData, OrderStatus } from "@/types/order-types";
import { getMethodSettlement, type MethodSettlement } from "@/utils/settlement";

interface UsePaymentFlowParams {
	clientData: ClientFormData;
	isClientFormValid: boolean;
	onStepChange?: (step: number) => void;
}

/**
 * Máquina de estados del checkout de pago: pasos, estado de la orden y los
 * handlers que disparan cada transición. Extraída de PaymentMethodsSection para
 * que la vista quede como composición delgada y la lógica sea aislable.
 */
export function usePaymentFlow({
	clientData,
	isClientFormValid,
	onStepChange,
}: UsePaymentFlowParams) {
	const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
	const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
	const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
	const [orderId, setOrderId] = useState<number | null>(null);
	const [trackingToken, setTrackingToken] = useState<string | null>(null);
	const [deliveredAccounts, setDeliveredAccounts] = useState<
		DeliveredAccount[]
	>([]);
	// Cuando el carrito tiene servicios bajo pedido, se consulta disponibilidad
	// antes de habilitar el pago.
	const [awaitingAvailability, setAwaitingAvailability] = useState(false);
	// URL del comprobante subido (Pago Móvil), para la validación por Telegram.
	const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

	const cartItems = useCartStore((state) => state.items);
	const getTotalPrice = useCartStore((state) => state.getTotalPrice);
	const clearCart = useCartStore((state) => state.clearCart);
	const { data: exchangeRate } = useExchangeRate();

	const {
		mutate: createOrderMutation,
		isLoading: isCreatingOrder,
		error: createOrderError,
	} = useCreateOrder();
	const { data: services } = useServices();

	// Ítems del carrito que son "bajo pedido" (requieren consultar disponibilidad).
	const byRequestServiceIds = new Set(
		(services ?? []).filter((s) => s.is_by_request).map((s) => s.id),
	);
	const byRequestItems: AvailabilityItem[] = cartItems
		.filter((item) => byRequestServiceIds.has(Number(item.id)))
		.map((item) => ({
			serviceId: Number(item.id),
			title: item.title,
			months: item.months,
		}));

	// Total base en USD para los métodos automáticos (PayPal / tarjeta).
	const totalAmount = getTotalPrice();

	const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId);

	// Monto a cobrar según el método elegido (moneda de liquidación + recargo COP).
	const settlement: MethodSettlement | null = selectedMethod
		? getMethodSettlement(selectedMethod, cartItems, exchangeRate)
		: null;

	const handleBackToStep1 = () => {
		// No hacer nada con la orden, se mantiene en draft. El usuario puede volver
		// a continuar y se reutilizará la misma orden.
		setCurrentStep(1);
		onStepChange?.(1);
	};

	const handleContinueToStep2 = async () => {
		if (!selectedMethod || !isClientFormValid) return;

		// El monto y la moneda salen del método elegido (no del toggle global):
		// así PayPal/Binance liquidan en USD y los métodos manuales en su moneda
		// real, incluido el recargo COP de Bancolombia/Nequi.
		const orderSettlement = getMethodSettlement(
			selectedMethod,
			cartItems,
			exchangeRate,
		);

		const order = await createOrderMutation({
			client_name: clientData.name,
			client_phone: clientData.phone,
			client_email: clientData.email,
			amount: orderSettlement.total,
			payment_method: selectedMethod.name,
			currency: orderSettlement.currency,
			items: cartItems,
		});

		if (order) {
			setOrderId(order.id);
			setTrackingToken(order.tracking_token);
			onStepChange?.(2);
			// Si hay servicios bajo pedido, consultar disponibilidad antes de pagar.
			if (byRequestItems.length > 0) {
				setAwaitingAvailability(true);
			} else {
				setCurrentStep(2);
			}
		}
	};

	const handleAvailabilityConfirmed = () => {
		setAwaitingAvailability(false);
		setCurrentStep(2);
	};

	const handleAvailabilityBack = () => {
		setAwaitingAvailability(false);
		handleBackToStep1();
	};

	// PayPal / tarjeta: el server capturó el pago, marcó la orden `completed` Y la
	// entregó (service-role, bypasea RLS). Acá solo reflejamos estado + lo
	// entregado, sin escribir a DB desde el cliente (la RLS lo bloquearía).
	const handleAutomaticDelivered = (delivered: DeliveredAccount[]) => {
		setDeliveredAccounts(delivered);
		setOrderStatus("completed");
		setCurrentStep(3);
		onStepChange?.(3);
		clearCart();
	};

	// Binance: el server ya marcó la orden `completed` Y la entregó (devuelve las
	// credenciales). Acá solo reflejamos estado + lo entregado, sin re-escribir DB.
	const handleBinanceVerified = (delivered: DeliveredAccount[]) => {
		setDeliveredAccounts(delivered);
		setOrderStatus("completed");
		setCurrentStep(3);
		onStepChange?.(3);
		clearCart();
	};

	// Pago Móvil: subió el comprobante → crear ticket de validación y pasar al
	// paso "Validando…". El admin aprueba/rechaza por Telegram.
	const handlePagoMovilSubmit = (uploadedReceiptUrl: string) => {
		// La orden se marca 'validating' server-side al crear el ticket (dentro
		// de createPaymentValidationRequest), así que acá solo cambiamos de paso.
		setReceiptUrl(uploadedReceiptUrl);
		setOrderStatus("validating");
		setCurrentStep(3);
		onStepChange?.(3);
	};

	// El admin aprobó el pago: el trigger ya completó/entregó la orden server-side.
	// Acá reflejamos las credenciales y pasamos a la confirmación.
	const handlePaymentValidationApproved = (delivered: DeliveredAccount[]) => {
		setDeliveredAccounts(delivered);
		setOrderStatus("completed");
		clearCart();
	};

	const handlePaymentError = (error: unknown) => {
		console.error("Payment error:", error);
		toast.error("Hubo un problema al procesar el pago. Intenta de nuevo.");
	};

	return {
		currentStep,
		selectedMethodId,
		setSelectedMethodId,
		orderStatus,
		orderId,
		trackingToken,
		deliveredAccounts,
		awaitingAvailability,
		receiptUrl,
		cartItems,
		totalAmount,
		selectedMethod,
		settlement,
		byRequestItems,
		isCreatingOrder,
		createOrderError,
		handleContinueToStep2,
		handleAvailabilityConfirmed,
		handleAvailabilityBack,
		handleBackToStep1,
		handleAutomaticDelivered,
		handleBinanceVerified,
		handlePagoMovilSubmit,
		handlePaymentValidationApproved,
		handlePaymentError,
	};
}
