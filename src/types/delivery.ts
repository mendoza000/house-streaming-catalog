import { array, number, type ObjectSchema, object, string } from "yup";

/** Una pantalla entregada al cliente tras confirmar el pago. */
export interface DeliveredAccount {
	service: string | null;
	mail: string | null;
	password: string | null;
	screen: number;
	/** Fecha de vencimiento de la pantalla (ISO). null si la venta no fijó meses. */
	expires_at: string | null;
}

/**
 * Valida en runtime lo que devuelve la función Postgres `fulfill_order`. El RPC
 * llega tipado como `any`; este schema garantiza que cada fila tenga la forma
 * esperada antes de entregarla al cliente, en vez de castear a ciegas.
 */
export const deliveredAccountSchema: ObjectSchema<DeliveredAccount> = object({
	service: string().nullable().defined(),
	mail: string().nullable().defined(),
	password: string().nullable().defined(),
	screen: number().required(),
	expires_at: string().nullable().defined(),
});

export const deliveredAccountsSchema = array(deliveredAccountSchema).required();
