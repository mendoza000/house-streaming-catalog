import { useState } from "react";
import type { RenewalSelection } from "@/types/renewal-types";

export interface CreatedRenewal {
	orderId: number;
	trackingToken: string;
	amount: number;
	currency: string;
}

/**
 * Crea la orden de renovación vía POST /api/account/renew. El servidor revalida la
 * propiedad de las pantallas y fija el monto desde `screen_price`.
 */
export function useCreateRenewal() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const create = async (input: {
		phone: string;
		selections: RenewalSelection[];
		methodId: string;
	}): Promise<CreatedRenewal | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/account/renew", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			const json = await res.json();
			if (!res.ok) {
				setError(json.error ?? "No pudimos crear la renovación.");
				return null;
			}
			return json as CreatedRenewal;
		} catch {
			setError("No pudimos crear la renovación. Probá de nuevo.");
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	return { create, isLoading, error };
}
