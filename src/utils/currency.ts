import type { Currency } from "@/stores/currency-store"

/**
 * Format a number with thousand separators
 */
function formatWithThousands(value: number, decimals = 2): string {
	return value.toLocaleString("es-VE", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	})
}

/**
 * Format a price with the appropriate currency symbol
 */
export function formatPrice(
	price: number,
	currency: Currency,
	decimals = 2,
): string {
	// Round to specified decimals to avoid floating point issues
	const roundedPrice = Math.round(price * 100) / 100
	const formattedPrice = formatWithThousands(roundedPrice, decimals)

	if (currency === "USD") {
		return `$${formattedPrice}`
	}

	return `${formattedPrice} Bs`
}

/**
 * Convert USD price to VES if currency is VES and exchange rate is available
 */
export function convertPrice(
	usdPrice: number,
	currency: Currency,
	exchangeRate?: number,
): number {
	if (currency === "VES" && exchangeRate) {
		return usdPrice * exchangeRate
	}
	return usdPrice
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
	return currency === "USD" ? "$" : "Bs"
}

/**
 * Get currency label
 */
export function getCurrencyLabel(currency: Currency): string {
	return currency === "USD" ? "USD" : "VES (Bolívares)"
}
