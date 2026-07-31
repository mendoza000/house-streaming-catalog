import { useState } from "react";
import {
	requestPasswordReset,
	signIn,
	signOut,
	signUp,
	updatePassword,
} from "@/api/auth";

/** Wrapper de las acciones de auth con loading/error, mismo patrón que useCreateOrder. */
export function useAuth() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function run<T>(action: () => Promise<{ error: Error | null } & T>) {
		setIsLoading(true);
		setError(null);
		try {
			const result = await action();
			if (result.error) {
				setError(result.error.message);
				return null;
			}
			return result;
		} finally {
			setIsLoading(false);
		}
	}

	const register = (email: string, password: string) =>
		run(() => signUp(email, password));

	const login = (email: string, password: string) =>
		run(() => signIn(email, password));

	const logout = () => run(() => signOut());

	const requestReset = (email: string) =>
		run(() => requestPasswordReset(email));

	const changePassword = (newPassword: string) =>
		run(() => updatePassword(newPassword));

	return {
		isLoading,
		error,
		register,
		login,
		logout,
		requestReset,
		changePassword,
	};
}
