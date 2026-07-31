import { useEffect, useState } from "react";
import { getMyOrders, getMyStreamingAccounts } from "@/api/my-account";
import type { MyStreamingAccount } from "@/types/account-types";
import type { Order } from "@/types/supabase";

/** Trae compras + cuentas del cliente autenticado. Se dispara al montar / cambiar email. */
export function useMyAccount(email: string | null) {
	const [orders, setOrders] = useState<Order[] | null>(null);
	const [accounts, setAccounts] = useState<MyStreamingAccount[] | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!email) {
			setOrders(null);
			setAccounts(null);
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		setIsLoading(true);
		setError(null);

		Promise.all([getMyOrders(email), getMyStreamingAccounts()]).then(
			([ordersResult, accountsResult]) => {
				if (cancelled) return;

				if (ordersResult.error || accountsResult.error) {
					setError(
						ordersResult.error?.message ??
							accountsResult.error?.message ??
							"No pudimos cargar tu cuenta",
					);
				}

				setOrders(ordersResult.data);
				setAccounts(accountsResult.data);
				setIsLoading(false);
			},
		);

		return () => {
			cancelled = true;
		};
	}, [email]);

	return { orders, accounts, isLoading, error };
}
