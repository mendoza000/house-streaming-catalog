import { useQuery } from "@tanstack/react-query";
import { getServiceStock } from "@/api/services";

export const serviceStockKeys = {
	all: ["service-stock"] as const,
};

/**
 * Stock de pantallas por servicio. staleTime corto: el stock cambia con cada
 * venta, así que conviene refrescarlo seguido.
 */
export function useServiceStock() {
	return useQuery({
		queryKey: serviceStockKeys.all,
		queryFn: getServiceStock,
		staleTime: 1000 * 60, // 1 minuto
	});
}
