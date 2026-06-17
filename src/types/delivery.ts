/** Una pantalla entregada al cliente tras confirmar el pago. */
export interface DeliveredAccount {
	service: string | null
	mail: string | null
	password: string | null
	screen: number
	/** Fecha de vencimiento de la pantalla (ISO). null si la venta no fijó meses. */
	expires_at: string | null
}
