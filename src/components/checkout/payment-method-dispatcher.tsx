"use client";

import type { PaymentMethod } from "@/constants/payment-methods";
import type { DeliveredAccount } from "@/types/delivery";
import { BinancePaymentStep } from "./payment-steps/binance-payment-step";
import { CreditCardPaymentStep } from "./payment-steps/credit-card-payment-step";
import { ManualPaymentStep } from "./payment-steps/manual-payment-step";
import { PayPalPaymentStep } from "./payment-steps/paypal-payment-step";

interface PaymentMethodDispatcherProps {
	method: PaymentMethod;
	orderId: number;
	amount: number;
	onAutomaticDelivered: (delivered: DeliveredAccount[]) => void;
	onBinanceVerified: (delivered: DeliveredAccount[]) => void;
	onManualSubmit: (receiptUrl: string) => void;
	onPaymentError: (error: unknown) => void;
	onBack: () => void;
}

/**
 * Paso 2 del checkout: rutea al componente de pago según el método elegido.
 * Todos los métodos manuales comparten el mismo paso (transferencia +
 * comprobante), diferenciados por la metadata del método.
 */
export function PaymentMethodDispatcher({
	method,
	orderId,
	amount,
	onAutomaticDelivered,
	onBinanceVerified,
	onManualSubmit,
	onPaymentError,
	onBack,
}: PaymentMethodDispatcherProps) {
	if (method.type === "manual") {
		return (
			<ManualPaymentStep
				method={method}
				onSubmit={onManualSubmit}
				onBack={onBack}
			/>
		);
	}

	switch (method.id) {
		case "binance-pay":
			return (
				<BinancePaymentStep
					method={method}
					orderId={orderId}
					onVerify={onBinanceVerified}
					onBack={onBack}
				/>
			);
		case "paypal":
			return (
				<PayPalPaymentStep
					orderId={orderId}
					amount={amount}
					onSuccess={onAutomaticDelivered}
					onError={onPaymentError}
					onBack={onBack}
				/>
			);
		case "credit-card":
			return (
				<CreditCardPaymentStep
					orderId={orderId}
					amount={amount}
					onSuccess={onAutomaticDelivered}
					onError={onPaymentError}
					onBack={onBack}
				/>
			);
		default:
			return null;
	}
}
