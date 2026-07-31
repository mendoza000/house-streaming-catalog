"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

/** Sin UI. Mantiene `useAuthStore` sincronizado con la sesión real de supabase-js. */
export function AuthListener() {
	const setUser = useAuthStore((s) => s.setUser);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(
				session?.user?.email
					? {
							email: session.user.email,
							emailConfirmed: !!session.user.email_confirmed_at,
						}
					: null,
			);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(
				session?.user?.email
					? {
							email: session.user.email,
							emailConfirmed: !!session.user.email_confirmed_at,
						}
					: null,
			);
		});

		return () => subscription.unsubscribe();
	}, [setUser]);

	return null;
}
