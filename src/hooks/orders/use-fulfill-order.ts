import { useState } from "react"
import type { DeliveredAccount } from "@/types/delivery"

interface FulfillResponse {
	fulfilled: boolean
	delivered?: DeliveredAccount[]
	reason?: "out_of_stock"
}

interface UseFulfillOrderResult {
	fulfill: (orderId: number) => Promise<FulfillResponse | null>
	isFulfilling: boolean
	error: Error | null
}

/**
 * Hook para entregar una orden ya pagada (PayPal / Pago Móvil, que completan
 * del lado cliente). Pega a /api/orders/fulfill. Binance ya entrega en su
 * propia verificación, así que no usa esto.
 */
export function useFulfillOrder(): UseFulfillOrderResult {
	const [isFulfilling, setIsFulfilling] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const fulfill = async (orderId: number): Promise<FulfillResponse | null> => {
		setIsFulfilling(true)
		setError(null)

		try {
			const response = await fetch("/api/orders/fulfill", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orderId }),
			})

			const data = await response.json()

			if (!response.ok) {
				const err = new Error(data?.error ?? "Failed to fulfill order")
				setError(err)
				return null
			}

			return data as FulfillResponse
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Failed to fulfill order")
			setError(error)
			return null
		} finally {
			setIsFulfilling(false)
		}
	}

	return { fulfill, isFulfilling, error }
}
