import { useQuery } from "@tanstack/react-query"
import { getServices } from "@/api/services"

export const servicesKeys = {
	all: ["services"] as const,
	detail: (id: number) => ["services", id] as const,
}

export function useServices() {
	return useQuery({
		queryKey: servicesKeys.all,
		queryFn: getServices,
		staleTime: 1000 * 60 * 5, // 5 minutes
	})
}
