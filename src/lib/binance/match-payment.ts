/**
 * Lógica PURA de matching de pagos de Binance Pay.
 *
 * Sin dependencias de Node, env ni red: recibe la lista de transacciones y los
 * parámetros de la orden, y devuelve las transacciones que la confirman.
 * Aislado a propósito para poder testearlo con fixtures.
 */

/**
 * Una transacción del endpoint Binance `GET /sapi/v1/pay/transactions`.
 * Solo se tipan los campos que usamos para validar.
 */
export interface BinancePayTransaction {
	orderType: string;
	transactionId: string;
	transactionTime: number;
	/** Monto como string. Positivo = entrante (recibido), negativo = saliente. */
	amount: string;
	currency: string;
	/** Nota de texto libre que escribe quien envía el pago. Puede no venir. */
	note?: string;
}

export interface MatchParams {
	/** Código único que debe aparecer en la nota, ej: "ord-123". */
	orderCode: string;
	/** Total esperado de la orden, ya convertido a USD. */
	expectedAmountUsd: number;
	/** Tolerancia de menos permitida en USD (comisiones/redondeos). Default 0.5. */
	toleranceUsd?: number;
	/** Moneda en la que se espera el pago. Default "USDT". */
	expectedCurrency?: string;
}

const DEFAULT_TOLERANCE_USD = 0.5;
const DEFAULT_CURRENCY = "USDT";

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Match del código como token, no como substring suelto.
 * Evita que "ord-12" matchee la nota "ord-123" (colisión de prefijo): exige
 * que el código esté delimitado por un caracter no-alfanumérico o el borde.
 */
function noteContainsOrderCode(note: string, orderCode: string): boolean {
	const pattern = new RegExp(
		`(^|[^a-z0-9])${escapeRegExp(orderCode.toLowerCase())}([^a-z0-9]|$)`,
		"i",
	);
	return pattern.test(note);
}

/**
 * Devuelve TODAS las transacciones que confirman la orden, de la más antigua a
 * la más reciente. La route luego descarta las que ya estén asociadas a otra
 * orden (anti-reuso) y se queda con la primera libre.
 *
 * Una transacción confirma la orden si:
 * - su `note` contiene el `orderCode` (la llave fuerte, única por orden)
 * - la `currency` coincide con la esperada (USDT)
 * - es entrante (`amount` > 0)
 * - el monto recibido cubre el total esperado menos la tolerancia
 */
export function findMatchingTransactions(
	transactions: BinancePayTransaction[],
	params: MatchParams,
): BinancePayTransaction[] {
	const tolerance = params.toleranceUsd ?? DEFAULT_TOLERANCE_USD;
	const currency = (params.expectedCurrency ?? DEFAULT_CURRENCY).toUpperCase();
	const minAmount = params.expectedAmountUsd - tolerance;

	return transactions
		.filter((tx) => {
			if (!noteContainsOrderCode(tx.note ?? "", params.orderCode)) return false;

			if (tx.currency?.toUpperCase() !== currency) return false;

			const amount = Number.parseFloat(tx.amount);
			if (!Number.isFinite(amount) || amount <= 0) return false;

			return amount >= minAmount;
		})
		.sort((a, b) => a.transactionTime - b.transactionTime);
}
