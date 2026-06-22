"use client";

import { usePaymentFlow } from "@/hooks/orders/use-payment-flow";
import type { ClientFormData } from "@/types/order-types";
import { OrderCompletion } from "./order-completion";
import { PaymentMethodDispatcher } from "./payment-method-dispatcher";
import { PaymentMethodSelection } from "./payment-method-selection";
import { AvailabilityCheckStep } from "./payment-steps/availability-check-step";

interface PaymentMethodsSectionProps {
	onStepChange?: (step: number) => void;
	clientData: ClientFormData;
	isClientFormValid: boolean;
}

export function PaymentMethodsSection({
	onStepChange,
	clientData,
	isClientFormValid,
}: PaymentMethodsSectionProps) {
	const flow = usePaymentFlow({ clientData, isClientFormValid, onStepChange });

	// Step 3: confirmación / validación (solo si la orden llegó a un estado terminal).
	const isCompletionVisible =
		flow.currentStep === 3 &&
		Boolean(
			(flow.orderStatus === "validating" && flow.orderId && flow.receiptUrl) ||
				flow.orderStatus === "completed",
		);

	if (isCompletionVisible) {
		return (
			<OrderCompletion
				orderStatus={flow.orderStatus}
				orderId={flow.orderId}
				receiptUrl={flow.receiptUrl}
				clientData={clientData}
				selectedMethod={flow.selectedMethod}
				settlement={flow.settlement}
				totalAmount={flow.totalAmount}
				cartItems={flow.cartItems}
				trackingToken={flow.trackingToken}
				deliveredAccounts={flow.deliveredAccounts}
				onValidationApproved={flow.handlePaymentValidationApproved}
			/>
		);
	}

	// Paso intermedio: consultar disponibilidad de servicios bajo pedido.
	if (flow.awaitingAvailability && flow.orderId) {
		return (
			<AvailabilityCheckStep
				items={flow.byRequestItems}
				client={{ name: clientData.name, phone: clientData.phone }}
				onAllAvailable={flow.handleAvailabilityConfirmed}
				onBack={flow.handleAvailabilityBack}
			/>
		);
	}

	// Step 2: componente de pago según el método elegido.
	if (flow.currentStep === 2 && flow.selectedMethod && flow.orderId) {
		return (
			<PaymentMethodDispatcher
				method={flow.selectedMethod}
				orderId={flow.orderId}
				amount={flow.totalAmount}
				onAutomaticDelivered={flow.handleAutomaticDelivered}
				onBinanceVerified={flow.handleBinanceVerified}
				onManualSubmit={flow.handlePagoMovilSubmit}
				onPaymentError={flow.handlePaymentError}
				onBack={flow.handleBackToStep1}
			/>
		);
	}

	// Step 1: selección de método de pago.
	return (
		<PaymentMethodSelection
			selectedMethodId={flow.selectedMethodId}
			onSelect={flow.setSelectedMethodId}
			onContinue={flow.handleContinueToStep2}
			cartItems={flow.cartItems}
			isClientFormValid={isClientFormValid}
			isCreatingOrder={flow.isCreatingOrder}
			hasCreateOrderError={Boolean(flow.createOrderError)}
		/>
	);
}
