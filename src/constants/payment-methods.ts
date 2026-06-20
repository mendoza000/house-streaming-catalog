import type { Currency } from "@/stores/currency-store";

export interface PaymentMethod {
	id: string;
	name: string;
	description: string;
	icon: string;
	type: "automatic" | "manual";
	/** Moneda en la que se liquida este método (define el total a cobrar). */
	currency?: Currency;
	instructions?: string[];
	accountInfo?: {
		bank?: string;
		accountType?: string;
		accountNumber?: string;
		phone?: string;
		email?: string;
		holder?: string;
		id?: string;
	};
	binanceInfo?: {
		qrCodeUrl: string;
		binanceId: string;
	};
	verificationTimeSeconds?: number;
}

const MANUAL_INSTRUCTIONS = [
	"Realiza la transferencia a la siguiente cuenta",
	"Sube el comprobante de pago",
	"Espera la confirmación de tu pedido",
];

export const PAYMENT_METHODS: PaymentMethod[] = [
	{
		id: "binance-pay",
		name: "Binance Pay",
		description: "Pago instantáneo con criptomonedas",
		icon: "₿",
		type: "automatic",
		currency: "USD",
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
		currency: "USD",
	},
	{
		id: "pago-movil",
		name: "Pago Móvil",
		description: "Transferencia bancaria venezolana",
		icon: "🏦",
		type: "manual",
		currency: "VES",
		instructions: MANUAL_INSTRUCTIONS,
		accountInfo: {
			bank: "Banco de Venezuela",
			phone: "04247748245",
			holder: "Omar Mendoza",
			id: "30261759",
		},
	},
	{
		id: "bancolombia",
		name: "Bancolombia",
		description: "Transferencia bancaria colombiana",
		icon: "🏦",
		type: "manual",
		currency: "COP",
		instructions: MANUAL_INSTRUCTIONS,
		accountInfo: {
			bank: "Bancolombia",
			accountType: "Ahorros",
			accountNumber: "08867752260",
			holder: "Miguel Vivas",
			id: "CC 1.100.979.073",
		},
	},
	{
		id: "nequi",
		name: "Nequi",
		description: "Pago móvil colombiano",
		icon: "📱",
		type: "manual",
		currency: "COP",
		instructions: MANUAL_INSTRUCTIONS,
		accountInfo: {
			phone: "3117386217",
			holder: "Miguel Vivas",
		},
	},
	{
		id: "zinli",
		name: "Zinli",
		description: "Billetera digital en dólares",
		icon: "💳",
		type: "manual",
		currency: "USD",
		instructions: MANUAL_INSTRUCTIONS,
		accountInfo: {
			email: "mendoza000.dev@gmail.com",
			holder: "Miguel Vivas",
		},
	},
];
