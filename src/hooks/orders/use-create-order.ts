import { useState } from "react";
import { createOrUpdateDraftOrder } from "@/api/orders";
import type { CreateOrderData } from "@/types/order-types";
import type { Order } from "@/types/supabase";

interface UseCreateOrderResult {
	mutate: (data: CreateOrderData) => Promise<Order | null>;
	isLoading: boolean;
	error: Error | null;
	data: Order | null;
	reset: () => void;
}

/**
 * Hook for creating/updating draft orders with loading and error states
 * @returns Object with mutate function and state
 */
export function useCreateOrder(): UseCreateOrderResult {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [data, setData] = useState<Order | null>(null);

	const mutate = async (orderData: CreateOrderData): Promise<Order | null> => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await createOrUpdateDraftOrder(orderData);

			if (result.error) {
				setError(result.error);
				setData(null);
				return null;
			}

			setData(result.data);
			return result.data;
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error("Failed to create/update order");
			setError(error);
			setData(null);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const reset = () => {
		setIsLoading(false);
		setError(null);
		setData(null);
	};

	return {
		mutate,
		isLoading,
		error,
		data,
		reset,
	};
}
