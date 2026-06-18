import type { PaymentMethod } from "@/constants/payment-methods";
import type { CartItem } from "@/stores/cart-store";
import type { Currency } from "@/stores/currency-store";
import { COP_SURCHARGE_PER_UNIT, convertPrice } from "@/utils/currency";

export interface MethodSettlement {
	/** Moneda en la que se liquida (la del método, USD por defecto). */
	currency: Currency;
	/** Total base convertido a la moneda, sin recargo. */
	baseTotal: number;
	/** Recargo aplicado (COP por unidad). 0 si no corresponde. */
	surcharge: number;
	/** Total final a cobrar (baseTotal + surcharge). */
	total: number;
}

/**
 * Calcula el monto a cobrar para un método de pago dado. Única fuente de verdad:
 * la usa el paso de pago para mostrar el total, la creación de la orden para
 * persistir `amount`/`currency`, y la descripción del ticket de validación.
 *
 * - VES: total = base × tasa dinámica.
 * - COP: total = base × 4000 + 1000 por cada unidad (quantity) del carrito.
 * - USD: total = base.
 */
export function getMethodSettlement(
	method: PaymentMethod,
	items: CartItem[],
	exchangeRate?: number,
): MethodSettlement {
	const currency: Currency = method.currency ?? "USD";

	const baseUsd = items.reduce(
		(total, item) =>
			total + item.price * item.accounts * item.months * item.quantity,
		0,
	);

	const baseTotal = convertPrice(baseUsd, currency, exchangeRate);

	const surcharge =
		currency === "COP"
			? items.reduce((total, item) => total + item.quantity, 0) *
				COP_SURCHARGE_PER_UNIT
			: 0;

	return {
		currency,
		baseTotal,
		surcharge,
		total: baseTotal + surcharge,
	};
}
