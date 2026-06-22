"use client";

import { useState } from "react";
import { BinancePaymentStep } from "@/components/checkout/payment-steps/binance-payment-step";
import { ManualPaymentStep } from "@/components/checkout/payment-steps/manual-payment-step";
import { PaymentValidationStep } from "@/components/checkout/payment-steps/payment-validation-step";
import { PayPalPaymentStep } from "@/components/checkout/payment-steps/paypal-payment-step";
import type { PaymentMethod } from "@/constants/payment-methods";
import { formatPrice } from "@/utils/currency";
import type { MethodSettlement } from "@/utils/settlement";

interface RenewalPaymentStepProps {
	method: PaymentMethod;
	orderId: number;
	phone: string;
	settlement: MethodSettlement;
	onComplete: () => void;
	onBack: () => void;
}

/**
 * Paso 3: pago de la renovación. Reusa los mismos componentes de pago del checkout
 * (mismas rutas, que ya bifurcan a renovación server-side). El único cambio es que
 * el éxito no entrega credenciales: extiende el vencimiento, que se ve en /orden.
 */
export function RenewalPaymentStep({
	method,
	orderId,
	phone,
	settlement,
	onComplete,
	onBack,
}: RenewalPaymentStepProps) {
	const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

	// Flujo manual: subió comprobante → validación por el equipo.
	if (method.type === "manual") {
		if (receiptUrl) {
			return (
				<PaymentValidationStep
					input={{
						orderId,
						clientName: phone,
						clientPhone: phone,
						receiptUrl,
						description: `Renovación — Total ${formatPrice(
							settlement.total,
							settlement.currency,
						)}`,
					}}
					onApproved={() => onComplete()}
				/>
			);
		}
		return (
			<ManualPaymentStep
				method={method}
				settlement={settlement}
				onSubmit={(url) => setReceiptUrl(url)}
				onBack={onBack}
			/>
		);
	}

	// Flujo automático.
	switch (method.id) {
		case "binance-pay":
			return (
				<BinancePaymentStep
					method={method}
					orderId={orderId}
					onVerify={() => onComplete()}
					onBack={onBack}
				/>
			);
		case "paypal":
			return (
				<PayPalPaymentStep
					orderId={orderId}
					amount={settlement.total}
					onSuccess={() => onComplete()}
					onError={(err) => console.error("PayPal renewal error:", err)}
					onBack={onBack}
				/>
			);
		default:
			return null;
	}
}
