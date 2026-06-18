import type { Currency } from "@/stores/currency-store";

/** Tasa fija de conversión USD → COP (no sale de API, a diferencia de VES). */
export const COP_RATE = 4000;

/** Recargo en COP que se suma por cada unidad (quantity) al pagar en pesos. */
export const COP_SURCHARGE_PER_UNIT = 1000;

/** Los montos en VES se redondean hacia arriba al siguiente múltiplo de esto. */
export const VES_ROUND_UP_TO = 50;

/**
 * Format a number with thousand separators
 */
function formatWithThousands(value: number, decimals = 2): string {
	return value.toLocaleString("es-VE", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

/**
 * Format a price with the appropriate currency symbol
 */
export function formatPrice(
	price: number,
	currency: Currency,
	decimals = 2,
): string {
	// COP no usa decimales (USD × 4000 da enteros)
	const effectiveDecimals = currency === "COP" ? 0 : decimals;
	// Round to specified decimals to avoid floating point issues
	const roundedPrice = Math.round(price * 100) / 100;
	const formattedPrice = formatWithThousands(roundedPrice, effectiveDecimals);

	if (currency === "USD") {
		return `$${formattedPrice}`;
	}

	if (currency === "COP") {
		return `${formattedPrice} COP`;
	}

	return `${formattedPrice} Bs`;
}

/**
 * Convert USD price to the selected currency.
 * VES usa la tasa dinámica y se redondea hacia arriba al múltiplo VES_ROUND_UP_TO
 * (nunca cobramos de menos por redondeo); COP usa la tasa fija COP_RATE.
 */
export function convertPrice(
	usdPrice: number,
	currency: Currency,
	exchangeRate?: number,
): number {
	if (currency === "VES" && exchangeRate) {
		const ves = usdPrice * exchangeRate;
		return Math.ceil(ves / VES_ROUND_UP_TO) * VES_ROUND_UP_TO;
	}
	if (currency === "COP") {
		return usdPrice * COP_RATE;
	}
	return usdPrice;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
	if (currency === "USD") return "$";
	if (currency === "COP") return "COP";
	return "Bs";
}

/**
 * Get currency label
 */
export function getCurrencyLabel(currency: Currency): string {
	if (currency === "USD") return "USD";
	if (currency === "COP") return "COP (Pesos)";
	return "VES (Bolívares)";
}
