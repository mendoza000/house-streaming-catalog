import type { Metadata } from "next";
import { SupportForm } from "@/components/support/support-form";

export const metadata: Metadata = {
	title: "Soporte",
	description:
		"¿Tienes un problema con tu cuenta? Solicita soporte y nuestro equipo te ayudará por WhatsApp.",
};

export default function SoportePage() {
	return (
		<div className="container mx-auto px-5 mt-24 mb-16">
			<div className="max-w-2xl mx-auto">
				<div className="mb-8 text-center">
					<h1 className="text-4xl md:text-5xl font-bold leading-tight">
						¿Necesitas ayuda?
					</h1>
					<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
						Estamos para ayudarte. Cuéntanos qué problema tienes con tu cuenta y
						te contactaremos por WhatsApp lo antes posible.
					</p>
				</div>

				<SupportForm />
			</div>
		</div>
	);
}
