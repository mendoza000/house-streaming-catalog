import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export interface AuthResult {
	user: User | null;
	session: Session | null;
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/**
 * Crea la cuenta de un cliente. Requiere confirmación de email (config en el
 * dashboard de Supabase) — hasta confirmar, `session` viene null.
 */
export async function signUp(
	email: string,
	password: string,
): Promise<{ data: AuthResult | null; error: Error | null }> {
	try {
		const { data, error } = await supabase.auth.signUp({
			email: normalizeEmail(email),
			password,
			options: {
				emailRedirectTo: `${window.location.origin}/cuenta`,
			},
		});

		if (error) return { data: null, error: new Error(error.message) };

		return { data: { user: data.user, session: data.session }, error: null };
	} catch (error) {
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("No se pudo crear la cuenta"),
		};
	}
}

export async function signIn(
	email: string,
	password: string,
): Promise<{ data: AuthResult | null; error: Error | null }> {
	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: normalizeEmail(email),
			password,
		});

		if (error) return { data: null, error: new Error(error.message) };

		return { data: { user: data.user, session: data.session }, error: null };
	} catch (error) {
		return {
			data: null,
			error:
				error instanceof Error ? error : new Error("No se pudo iniciar sesión"),
		};
	}
}

export async function signOut(): Promise<{ error: Error | null }> {
	try {
		const { error } = await supabase.auth.signOut();
		if (error) return { error: new Error(error.message) };
		return { error: null };
	} catch (error) {
		return {
			error:
				error instanceof Error ? error : new Error("No se pudo cerrar sesión"),
		};
	}
}

/** Envía el email de recuperación; el link redirige a /cuenta/nueva-password. */
export async function requestPasswordReset(
	email: string,
): Promise<{ error: Error | null }> {
	try {
		const { error } = await supabase.auth.resetPasswordForEmail(
			normalizeEmail(email),
			{
				redirectTo: `${window.location.origin}/cuenta/nueva-password`,
			},
		);
		if (error) return { error: new Error(error.message) };
		return { error: null };
	} catch (error) {
		return {
			error:
				error instanceof Error
					? error
					: new Error("No se pudo enviar el correo de recuperación"),
		};
	}
}

/** Setea la nueva contraseña; requiere la sesión de recuperación ya activa en el cliente. */
export async function updatePassword(
	newPassword: string,
): Promise<{ error: Error | null }> {
	try {
		const { error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) return { error: new Error(error.message) };
		return { error: null };
	} catch (error) {
		return {
			error:
				error instanceof Error
					? error
					: new Error("No se pudo actualizar la contraseña"),
		};
	}
}
