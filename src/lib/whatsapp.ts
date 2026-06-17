const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

const DEFAULT_MESSAGE =
	"¡Hola! Quiero más información sobre las cuentas de streaming.";

/**
 * Arma el enlace de WhatsApp (wa.me) hacia el número del negocio.
 * El número se toma de NEXT_PUBLIC_WHATSAPP_NUMBER y debe ir sin "+" ni
 * espacios (formato E.164 sin símbolos, ej: 584247748245).
 */
export function getWhatsAppUrl(message: string = DEFAULT_MESSAGE): string {
	return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
