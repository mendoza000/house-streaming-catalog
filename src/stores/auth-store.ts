import { create } from "zustand";

interface AuthUser {
	email: string;
	emailConfirmed: boolean;
}

interface AuthStore {
	user: AuthUser | null;
	isLoggedIn: boolean;
	setUser: (user: AuthUser | null) => void;
}

/**
 * Solo espeja estado NO sensible para UI reactiva (navbar, banner). La sesión
 * real (tokens) ya la persiste supabase-js en localStorage por su cuenta — no
 * duplicarla acá evita tener dos fuentes de verdad. Se puebla desde
 * `AuthListener` vía `supabase.auth.onAuthStateChange`.
 */
export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	isLoggedIn: false,
	setUser: (user) => set({ user, isLoggedIn: !!user }),
}));
