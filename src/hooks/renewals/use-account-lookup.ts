import { useState } from "react";
import type { RenewableAccount } from "@/types/renewal-types";

/**
 * Busca las pantallas renovables de un teléfono vía POST /api/account/lookup.
 * El matcheo y la lectura de `clients` ocurren server-side (service-role).
 */
export function useAccountLookup() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [accounts, setAccounts] = useState<RenewableAccount[] | null>(null);

	const lookup = async (phone: string): Promise<RenewableAccount[] | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/account/lookup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phone }),
			});
			const json = await res.json();
			if (!res.ok) {
				setError(json.error ?? "No pudimos buscar tus cuentas.");
				setAccounts(null);
				return null;
			}
			const found = (json.accounts ?? []) as RenewableAccount[];
			setAccounts(found);
			return found;
		} catch {
			setError("No pudimos buscar tus cuentas. Probá de nuevo.");
			setAccounts(null);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const reset = () => {
		setAccounts(null);
		setError(null);
		setIsLoading(false);
	};

	return { lookup, isLoading, error, accounts, reset };
}
