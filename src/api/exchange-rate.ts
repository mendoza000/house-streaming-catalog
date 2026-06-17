/**
 * Exchange rate API response from CriptoYa
 */
interface ExchangeRateResponse {
	totalAsk: number;
	totalBid: number;
	[key: string]: unknown;
}

/**
 * Fetch USDT/VES exchange rate from CriptoYa Binance P2P API
 * @returns The current exchange rate for USDT to VES
 */
export async function getExchangeRate(): Promise<number> {
	try {
		const response = await fetch(
			"https://criptoya.com/api/binancep2p/USDT/VES/2000",
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: ExchangeRateResponse = await response.json();

		// Use totalAsk as the exchange rate (price to buy USDT with VES)
		if (!data.totalAsk || typeof data.totalAsk !== "number") {
			throw new Error("Invalid exchange rate data received");
		}

		return data.totalAsk;
	} catch (error) {
		console.error("Error fetching exchange rate:", error);
		// Return a fallback rate or rethrow based on requirements
		throw error;
	}
}
