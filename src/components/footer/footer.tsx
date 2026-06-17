import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const NAV_LINKS = [
	{ href: "/", label: "Inicio" },
	{ href: "/quienes-somos", label: "Quiénes somos" },
];

const PAYMENT_METHODS = ["PayPal", "Binance Pay", "Pago Móvil"];

export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t mt-16 bg-background">
			<div className="container mx-auto px-5 py-12">
				<div className="grid gap-8 md:grid-cols-3">
					{/* Marca */}
					<div>
						<strong className="text-lg">House Streaming</strong>
						<p className="mt-2 text-sm text-muted-foreground max-w-xs">
							Tus servicios de streaming favoritos en un solo lugar. Entrega
							automática, renovación y soporte 24/7.
						</p>
					</div>

					{/* Navegación */}
					<div>
						<h3 className="text-sm font-semibold mb-3">Navegación</h3>
						<ul className="space-y-2">
							{NAV_LINKS.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
							<li>
								<a
									href={getWhatsAppUrl()}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Contacto
								</a>
							</li>
						</ul>
					</div>

					{/* Métodos de pago */}
					<div>
						<h3 className="text-sm font-semibold mb-3">Métodos de pago</h3>
						<ul className="space-y-2">
							{PAYMENT_METHODS.map((method) => (
								<li key={method} className="text-sm text-muted-foreground">
									{method}
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
					© {year} House Streaming. Todos los derechos reservados.
				</div>
			</div>
		</footer>
	);
}
