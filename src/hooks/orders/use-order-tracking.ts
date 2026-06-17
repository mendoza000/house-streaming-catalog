import { useQuery } from "@tanstack/react-query";
import type { OrderTrackingResponse } from "@/types/order-types";

export const orderTrackingKeys = {
	byToken: (token: string) => ["order-tracking", token] as const,
};

/** Estados terminales: una vez acá, no tiene sentido seguir pooleando. */
const TERMINAL = new Set(["completed", "failed", "cancelled"]);

async function fetchOrderTracking(
	token: string,
): Promise<OrderTrackingResponse> {
	const res = await fetch(`/api/orders/track/${token}`);
	if (res.status === 404) {
		throw new Error("not_found");
	}
	if (!res.ok) {
		throw new Error("fetch_error");
	}
	return res.json();
}

/**
 * Seguimiento de una orden por su token secreto. Poolea cada 5s mientras la
 * orden no esté en un estado terminal (pago aún en validación). Cuando se
 * completa, la respuesta ya incluye las credenciales entregadas.
 */
export function useOrderTracking(token: string) {
	return useQuery({
		queryKey: orderTrackingKeys.byToken(token),
		queryFn: () => fetchOrderTracking(token),
		enabled: token.length > 0,
		retry: (failureCount, error) =>
			error.message !== "not_found" && failureCount < 3,
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			if (status && TERMINAL.has(status)) return false;
			return 5000;
		},
	});
}
