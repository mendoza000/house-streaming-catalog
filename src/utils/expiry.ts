import type { ExpiryStatus } from "@/types/renewal-types";

/**
 * Estado de vigencia derivado de `expires_at`. Misma lógica que el panel admin
 * (flix-box-ultra) para que cliente y admin vean lo mismo.
 */

/** Días de antelación para considerar una pantalla "por vencer". */
export const EXPIRY_SOON_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export function getExpiryStatus(
	expiresAt: string | null | undefined,
): ExpiryStatus {
	if (!expiresAt) return "none";
	const exp = new Date(expiresAt).getTime();
	if (Number.isNaN(exp)) return "none";
	const now = Date.now();
	if (exp < now) return "expired";
	if (exp <= now + EXPIRY_SOON_DAYS * DAY_MS) return "soon";
	return "active";
}

export function formatExpiry(expiresAt: string): string {
	// expires_at se guarda como medianoche UTC del día de pago (15/25). Hay que
	// formatear EN UTC: sin esto, en husos negativos (VE -4, CO -5) la medianoche
	// del 15 se renderiza como el 14 por la noche.
	return new Date(expiresAt).toLocaleDateString("es", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});
}

export const EXPIRY_LABEL: Record<
	Exclude<ExpiryStatus, "none">,
	{ label: string; className: string }
> = {
	active: {
		label: "Activa",
		className: "bg-primary/10 text-primary",
	},
	soon: {
		label: "Por vencer",
		className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	},
	expired: {
		label: "Vencida",
		className: "bg-destructive/10 text-destructive",
	},
};
