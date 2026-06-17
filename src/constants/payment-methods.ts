export interface PaymentMethod {
	id: string;
	name: string;
	description: string;
	icon: string;
	type: "automatic" | "manual";
	instructions?: string[];
	accountInfo?: {
		bank?: string;
		phone?: string;
		holder?: string;
		id?: string;
	};
	binanceInfo?: {
		qrCodeUrl: string;
		binanceId: string;
	};
	verificationTimeSeconds?: number;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
	{
		id: "binance-pay",
		name: "Binance Pay",
		description: "Pago instantáneo con criptomonedas",
		icon: "₿",
		type: "automatic",
		binanceInfo: {
			qrCodeUrl: "/binance-qr.jpg",
			binanceId: "426860253",
		},
		verificationTimeSeconds: 300,
	},
	{
		id: "paypal",
		name: "PayPal",
		description: "Pago seguro con cuenta PayPal",
		icon: "P",
		type: "automatic",
	},
	{
		id: "pago-movil",
		name: "Pago Móvil",
		description: "Transferencia bancaria venezolana",
		icon: "🏦",
		type: "manual",
		instructions: [
			"Realiza la transferencia a la siguiente cuenta",
			"Sube el comprobante de pago",
			"Espera la confirmación de tu pedido",
		],
		accountInfo: {
			bank: "Banco de Venezuela",
			phone: "04247748245",
			holder: "Omar Mendoza",
			id: "30261759",
		},
	},
];
