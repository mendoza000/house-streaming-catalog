import crypto from "node:crypto"
import type { BinancePayTransaction } from "@/lib/binance/match-payment"

/**
 * Cliente SERVER-ONLY de Binance.
 *
 * El endpoint `GET /sapi/v1/pay/transactions` está firmado con HMAC SHA256
 * usando el API secret, así que NUNCA puede ejecutarse en el cliente.
 * `BINANCE_API_SECRET` jamás debe ser NEXT_PUBLIC.
 */

const BINANCE_API_BASE = "https://api.binance.com"
const RECV_WINDOW = 60_000

function sign(query: string, secret: string): string {
	return crypto.createHmac("sha256", secret).update(query).digest("hex")
}

/**
 * Hora del server de Binance (epoch ms). Binance rechaza requests cuyo timestamp
 * esté adelantado respecto a su reloj (error -1021), y el recvWindow no cubre el
 * adelanto. Usamos la hora del server como timestamp para evitar drift de reloj.
 * Si falla, caemos a Date.now() menos un margen conservador.
 */
async function getServerTime(): Promise<number> {
	try {
		const response = await fetch(`${BINANCE_API_BASE}/api/v3/time`)
		if (!response.ok) return Date.now() - 1000
		const json = await response.json()
		return typeof json.serverTime === "number" ? json.serverTime : Date.now() - 1000
	} catch {
		return Date.now() - 1000
	}
}

interface GetPayTransactionsParams {
	/** Epoch ms. Si se omite, Binance devuelve los últimos 90 días. */
	startTime?: number
	/** Epoch ms. */
	endTime?: number
}

/**
 * Consulta el historial de Binance Pay de la cuenta (entrantes y salientes).
 * Sigue el patrón result-tuple del proyecto: nunca lanza, devuelve { data, error }.
 */
export async function getPayTransactions(
	params: GetPayTransactionsParams = {},
): Promise<{ data: BinancePayTransaction[] | null; error: Error | null }> {
	const apiKey = process.env.BINANCE_API_KEY
	const apiSecret = process.env.BINANCE_API_SECRET

	if (!apiKey || !apiSecret) {
		return {
			data: null,
			error: new Error(
				"Binance credentials not configured: BINANCE_API_KEY and BINANCE_API_SECRET are required",
			),
		}
	}

	try {
		const timestamp = await getServerTime()

		const query = new URLSearchParams()
		if (params.startTime) query.set("startTime", String(params.startTime))
		if (params.endTime) query.set("endTime", String(params.endTime))
		query.set("limit", "100")
		query.set("recvWindow", String(RECV_WINDOW))
		query.set("timestamp", String(timestamp))

		const signature = sign(query.toString(), apiSecret)
		query.set("signature", signature)

		const response = await fetch(
			`${BINANCE_API_BASE}/sapi/v1/pay/transactions?${query.toString()}`,
			{ headers: { "X-MBX-APIKEY": apiKey } },
		)

		const json = await response.json()

		if (!response.ok) {
			console.error("Binance API error:", json)
			return {
				data: null,
				error: new Error(
					json?.msg ?? `Binance API error (status ${response.status})`,
				),
			}
		}

		return { data: (json.data ?? []) as BinancePayTransaction[], error: null }
	} catch (error) {
		console.error("Unexpected error querying Binance:", error)
		return {
			data: null,
			error:
				error instanceof Error
					? error
					: new Error("Failed to query Binance transactions"),
		}
	}
}
