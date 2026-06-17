import { getExchangeRate } from "@/api/exchange-rate";

/**
 * Monto USD a cobrar por PayPal, derivado SIEMPRE de la orden en DB (no del
 * cliente). Si la orden está en VES se convierte con la tasa actual. Esto impide
 * que el browser decida cuánto se cobra: lo usa create-order para fijar el monto
 * y capture-order para re-verificar el monto capturado.
 */
export async function expectedUsdAmount(order: {
	amount: number | null;
	currency: string | null;
}): Promise<number> {
	if (order.amount == null) {
		throw new Error("Order has no amount");
	}
	if (order.currency === "VES") {
		const rate = await getExchangeRate(); // VES por 1 USDT/USD
		return order.amount / rate;
	}
	return order.amount;
}
