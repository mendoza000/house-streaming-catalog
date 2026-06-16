/** Una pantalla entregada al cliente tras confirmar el pago. */
export interface DeliveredAccount {
	service: string | null
	mail: string | null
	password: string | null
	screen: number
}
