/**
 * Cuenta de streaming del cliente autenticado, tal como la devuelve
 * GET /api/account/credentials. Solo trae mail/password si la pantalla sigue
 * vigente (expiresAt futuro) — si venció, mail/password vienen null.
 */
export interface MyStreamingAccount {
	service: string;
	screen: number | null;
	expiresAt: string | null;
	isActive: boolean;
	mail: string | null;
	password: string | null;
}
