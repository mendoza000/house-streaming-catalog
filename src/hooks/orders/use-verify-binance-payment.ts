import { useState } from "react";
import type { DeliveredAccount } from "@/types/delivery";

interface VerifyResult {
	matched: boolean;
	alreadyCompleted?: boolean;
	transactionId?: string;
	delivered?: DeliveredAccount[];
	outOfStock?: boolean;
}

interface UseVerifyBinancePaymentResult {
	verify: (orderId: number) => Promise<VerifyResult | null>;
	isVerifying: boolean;
	error: Error | null;
}

/**
 * Hook para verificar el pago de una orden contra la API de Binance.
 * Pega a /api/binance/verify-payment (la validación real vive en el server).
 */
export function useVerifyBinancePayment(): UseVerifyBinancePaymentResult {
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const verify = async (orderId: number): Promise<VerifyResult | null> => {
		setIsVerifying(true);
		setError(null);

		try {
			const response = await fetch("/api/binance/verify-payment", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orderId }),
			});

			const data = await response.json();

			if (!response.ok) {
				const err = new Error(data?.error ?? "Failed to verify payment");
				setError(err);
				return null;
			}

			return data as VerifyResult;
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Failed to verify payment");
			setError(error);
			return null;
		} finally {
			setIsVerifying(false);
		}
	};

	return { verify, isVerifying, error };
}
