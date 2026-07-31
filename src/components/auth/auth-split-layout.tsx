import FaultyTerminal from "@/components/FaultyTerminal";

const FEATURES = [
	"Entrega automática al instante",
	"Pago con PayPal, Binance o Pago Móvil",
	"Soporte real por WhatsApp",
];

interface AuthSplitLayoutProps {
	children: React.ReactNode;
}

/**
 * Layout de dos paneles para /cuenta/login y /cuenta/registro: usa un fondo
 * animado (FaultyTerminal) para diferenciar las pantallas de auth del resto
 * del catálogo.
 */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
	return (
		<div className="grid min-h-screen md:grid-cols-2">
			<div className="relative hidden bg-black md:block">
				<div className="absolute inset-0">
					<FaultyTerminal
						scale={1.5}
						gridMul={[2, 1]}
						digitSize={1.2}
						timeScale={0.4}
						curvature={0.15}
						scanlineIntensity={0.3}
						tint="#ffffff"
						brightness={0.6}
						mouseReact
						mouseStrength={0.3}
					/>
				</div>
				<div className="absolute inset-0 bg-black/50" />
				<div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
					<strong className="text-xl tracking-tight pt-10">
						House Streaming
					</strong>
					<div className="max-w-md space-y-5">
						<h2 className="text-4xl leading-tight font-bold text-balance">
							Todas tus plataformas de streaming, en un solo lugar.
						</h2>
						<ul className="space-y-2.5 pt-2">
							{FEATURES.map((feature) => (
								<li
									key={feature}
									className="flex items-center gap-2.5 text-white/85"
								>
									<span className="size-1.5 shrink-0 rounded-full bg-white/70" />
									{feature}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			<div className="flex flex-col justify-center px-6 py-24 sm:px-12 lg:px-20">
				<div className="mx-auto w-full max-w-sm">{children}</div>
			</div>
		</div>
	);
}
