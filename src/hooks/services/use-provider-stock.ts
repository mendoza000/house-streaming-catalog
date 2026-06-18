import { useQuery } from "@tanstack/react-query";

export const providerStockKeys = {
	all: ["provider-stock"] as const,
};

/**
 * Mapa { serviceId local: stock } desde /api/provider-stock.
 */
async function getProviderStock(): Promise<Record<number, number>> {
	const response = await fetch("/api/provider-stock");
	if (!response.ok) {
		throw new Error("Failed to fetch provider stock");
	}
	return response.json();
}

/**
 * Stock de productos bajo pedido servido por el proveedor. staleTime corto:
 * el stock del proveedor cambia seguido, igual que el stock gestionado.
 */
export function useProviderStock() {
	return useQuery({
		queryKey: providerStockKeys.all,
		queryFn: getProviderStock,
		staleTime: 1000 * 60, // 1 minuto
	});
}
