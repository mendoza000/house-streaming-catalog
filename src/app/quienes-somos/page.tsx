import { Headphones, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
	title: "Quiénes somos",
	description:
		"Conocé House Streaming: tu acceso a Netflix, Disney+, HBO Max, Spotify y más, con entrega automática y soporte 24/7.",
};

const FEATURES = [
	{
		icon: Zap,
		title: "Entrega automática",
		description:
			"Recibís tus credenciales al instante apenas se confirma el pago, sin esperas.",
	},
	{
		icon: RefreshCw,
		title: "Renovación simple",
		description:
			"Renová tus suscripciones cuando quieras y mantené tus servicios sin interrupciones.",
	},
	{
		icon: Headphones,
		title: "Soporte 24/7",
		description:
			"Estamos para ayudarte en cualquier momento por WhatsApp ante cualquier duda.",
	},
	{
		icon: ShieldCheck,
		title: "Pago seguro",
		description:
			"Pagá con PayPal, Binance Pay o Pago Móvil de forma segura y confiable.",
	},
];

export default function QuienesSomosPage() {
	return (
		<div className="container mx-auto px-5 mt-24 mb-16">
			<div className="max-w-3xl">
				<h1 className="text-4xl md:text-5xl font-bold leading-tight">
					Quiénes somos
				</h1>
				<p className="mt-6 text-lg text-muted-foreground leading-relaxed">
					En <strong className="text-foreground">House Streaming</strong>{" "}
					reunimos todos tus servicios de streaming favoritos en un solo lugar.
					Accedé a Netflix, HBO Max, Prime Video, Disney+, Spotify, YouTube
					Premium, CapCut Pro y muchos más, con planes accesibles y entrega
					inmediata.
				</p>
				<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
					Nuestra misión es que disfrutes del mejor entretenimiento sin
					complicaciones: precios justos, entrega automática y un soporte que
					realmente responde.
				</p>
			</div>

			<div className="mt-12 grid gap-6 sm:grid-cols-2">
				{FEATURES.map((feature) => (
					<div
						key={feature.title}
						className="rounded-xl border p-6 bg-card transition-colors hover:border-primary/40"
					>
						<feature.icon className="h-8 w-8 text-primary" />
						<h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
						<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
							{feature.description}
						</p>
					</div>
				))}
			</div>

			<div className="mt-12 rounded-2xl border-2 bg-muted/30 p-8 text-center">
				<h2 className="text-2xl font-bold">¿Tenés dudas?</h2>
				<p className="mt-2 text-muted-foreground">
					Escribinos por WhatsApp y te ayudamos a elegir el plan ideal.
				</p>
				<Button asChild size="lg" className="mt-6">
					<a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
						Contactanos
					</a>
				</Button>
			</div>
		</div>
	);
}
