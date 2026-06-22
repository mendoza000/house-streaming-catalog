"use client";

import type { PaymentMethod } from "@/constants/payment-methods";
import type { CartItem } from "@/stores/cart-store";
import type { DeliveredAccount } from "@/types/delivery";
import type { ClientFormData, OrderStatus } from "@/types/order-types";
import { formatPrice } from "@/utils/currency";
import type { MethodSettlement } from "@/utils/settlement";
import { OrderConfirmationStep } from "./payment-steps/order-confirmation-step";
import { PaymentValidationStep } from "./payment-steps/payment-validation-step";

interface OrderCompletionProps {
	orderStatus: OrderStatus;
	orderId: number | null;
	receiptUrl: string | null;
	clientData: ClientFormData;
	selectedMethod: PaymentMethod | undefined;
	settlement: MethodSettlement | null;
	totalAmount: number;
	cartItems: CartItem[];
	trackingToken: string | null;
	deliveredAccounts: DeliveredAccount[];
	onValidationApproved: (delivered: DeliveredAccount[]) => void;
}

/**
 * Paso 3 del checkout: muestra el ticket de validación manual (Pago Móvil) o la
 * confirmación final con las credenciales entregadas. Devuelve null si la orden
 * todavía no llegó a un estado terminal.
 */
export function OrderCompletion({
	orderStatus,
	orderId,
	receiptUrl,
	clientData,
	selectedMethod,
	settlement,
	totalAmount,
	cartItems,
	trackingToken,
	deliveredAccounts,
	onValidationApproved,
}: OrderCompletionProps) {
	if (orderStatus === "validating" && orderId && receiptUrl) {
		const totalLabel = settlement
			? formatPrice(settlement.total, settlement.currency)
			: `$${totalAmount.toFixed(2)}`;
		const summary = `${cartItems
			.map((i) => `${i.title} x${i.quantity}`)
			.join(", ")} — Total ${totalLabel}`;
		return (
			<PaymentValidationStep
				input={{
					orderId,
					clientName: clientData.name,
					clientPhone: clientData.phone,
					receiptUrl,
					description: summary,
				}}
				onApproved={onValidationApproved}
			/>
		);
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
					trackingToken: trackingToken ?? undefined,
				}}
				deliveredAccounts={deliveredAccounts}
			/>
		);
	}

	return null;
}
