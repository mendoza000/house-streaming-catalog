import { LifeBuoy, MessageCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Accesos rápidos en mobile (md:hidden). En pantallas chicas la nav vive dentro
 * del drawer y estas acciones clave (renovar / soporte) se pierden; acá quedan a
 * la vista apenas se entra. Mismo patrón visual que PaymentMethodCard.
 */

interface QuickAction {
	icon: typeof RefreshCw;
	title: string;
	description: string;
}

function ActionCard({ icon: Icon, title, description }: QuickAction) {
	return (
		<Card className="cursor-pointer py-0 transition-all hover:border-primary hover:shadow-md">
			<CardHeader className="flex flex-row items-center gap-3 py-4">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
					<Icon className="size-6" />
				</div>
				<div>
					<CardTitle className="text-lg">{title}</CardTitle>
					<CardDescription className="text-sm">{description}</CardDescription>
				</div>
			</CardHeader>
		</Card>
	);
}

export default function QuickActions() {
	return (
		<section className="mt-12 px-4 md:hidden">
			<h2 className="mb-3 text-sm font-semibold text-muted-foreground">
				Accesos rápidos
			</h2>

			<div className="flex flex-col gap-4">
				<Link href="/mis-cuentas">
					<ActionCard
						icon={RefreshCw}
						title="Renovar"
						description="Extiende el vencimiento de tus cuentas"
					/>
				</Link>

				<Link href="/soporte">
					<ActionCard
						icon={LifeBuoy}
						title="Soporte"
						description="¿Necesitas ayuda? Estamos para ayudarte"
					/>
				</Link>

				<a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
					<ActionCard
						icon={MessageCircle}
						title="WhatsApp"
						description="Escríbenos y te respondemos al instante"
					/>
				</a>
			</div>
		</section>
	);
}
