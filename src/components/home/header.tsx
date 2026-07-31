import FaultyTerminal from "@/components/FaultyTerminal";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "../ui/button";

export default function Header() {
	return (
		<header className="relative border-2 shadow-lg mx-4 min-h-[50vh] rounded-2xl my-5 overflow-hidden flex flex-col items-center justify-center gap-4 px-6 py-12 mt-20">
			{/* Fondo animado */}
			<div className="absolute inset-0 z-0">
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
				{/* Overlay oscuro para mejorar legibilidad */}
				<div className="absolute inset-0 bg-black/70" />
			</div>

			{/* Contenido */}
			<div className="relative z-10 max-w-4xl text-center">
				<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
					Bienvenidos a House Streaming
				</h1>
				<p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-4 leading-relaxed">
					¡Accede a todos tus servicios de streaming favoritos en un solo lugar!
				</p>
				<p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
					Disfruta de Netflix, HBO Max, Prime Video, Disney+, Spotify, YouTube
					Premium, CapCut Pro y muchos más. Planes accesibles, renovación
					automática y soporte 24/7.
					<br />
					<span className="font-semibold text-white">
						¡Empieza a disfrutar del mejor entretenimiento hoy mismo!
					</span>
				</p>

				<div className="mt-8 flex justify-center gap-4">
					<Button asChild size="lg">
						<a href="#catalogo">Comenzar</a>
					</Button>
					{/* En mobile estas acciones viven en "Accesos rápidos" (QuickActions);
					    se ocultan acá para no duplicarlas. */}
					<Button
						asChild
						variant="outline-light"
						size="lg"
						className="hidden md:inline-flex"
					>
						<a
							href={getWhatsAppUrl()}
							target="_blank"
							rel="noopener noreferrer"
						>
							Contactanos
						</a>
					</Button>
					<Button
						asChild
						variant="outline-light"
						size="lg"
						className="hidden md:inline-flex"
					>
						<a href="/soporte">Soporte</a>
					</Button>
				</div>
			</div>
		</header>
	);
}
