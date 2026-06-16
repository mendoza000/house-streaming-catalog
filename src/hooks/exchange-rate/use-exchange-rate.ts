import { useQuery } from "@tanstack/react-query"
import { getExchangeRate } from "@/api/exchange-rate"

/**
 * Custom hook to fetch and cache the USDT/VES exchange rate
 * Caches the rate for 3 hours before refetching
 */
export function useExchangeRate() {
	return useQuery({
		queryKey: ["exchange-rate"],
		queryFn: getExchangeRate,
		staleTime: 1000 * 60 * 60 * 3, // 3 hours
		gcTime: 1000 * 60 * 60 * 3, // 3 hours (formerly cacheTime)
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: 2,
	})
}
