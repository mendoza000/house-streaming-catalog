import type { Metadata } from "next";

// Generic draft — must be reviewed by a lawyer before this ships to production.
export const metadata: Metadata = {
	title: "Política de Privacidad",
	description:
		"Cómo House Streaming recopila, utiliza y protege los datos personales de sus usuarios.",
};

const LAST_UPDATED = "17 de septiembre de 2026";

const SECTIONS = [
	{
		title: "1. Datos que recopilamos",
		paragraphs: [
			"Al utilizar la Plataforma, House Streaming puede recopilar los siguientes datos personales: nombre completo, correo electrónico, número de teléfono, país, comprobantes de pago (cuando se utiliza Pago Móvil) y el historial de pedidos asociado a la cuenta.",
			"También se almacena de forma local en el navegador de la persona usuaria el contenido del carrito de compras, con el fin de conservarlo entre sesiones.",
		],
	},
	{
		title: "2. Finalidad del tratamiento de datos",
		paragraphs: [
			"Los datos recopilados se utilizan para: procesar y dar seguimiento a los pedidos, entregar las credenciales de los servicios contratados, validar pagos, brindar soporte, enviar notificaciones relacionadas con la cuenta o el pedido (incluyendo correos de recuperación de contraseña) y mejorar la calidad del servicio.",
		],
	},
	{
		title: "3. Con quién compartimos los datos",
		paragraphs: [
			"House Streaming comparte datos personales únicamente en la medida necesaria para operar el servicio: con los procesadores de pago (PayPal, Binance) para validar transacciones, y con el sistema de mensajería utilizado para la entrega y gestión de pedidos por WhatsApp cuando el pedido lo requiere.",
			"House Streaming no vende ni cede datos personales a terceros con fines publicitarios.",
		],
	},
	{
		title: "4. Almacenamiento y seguridad",
		paragraphs: [
			"Los datos personales se almacenan en infraestructura de base de datos gestionada por Supabase, con controles de acceso a nivel de fila (Row Level Security) para restringir el acceso no autorizado a la información. House Streaming aplica medidas razonables para proteger los datos, aunque ningún sistema es completamente infalible.",
		],
	},
	{
		title: "5. Conservación de datos",
		paragraphs: [
			"Los datos personales se conservan mientras la cuenta permanezca activa o mientras sea necesario para cumplir con las finalidades descritas en esta política, incluyendo el historial de pedidos para fines de soporte y garantía.",
		],
	},
	{
		title: "6. Derechos de la persona usuaria",
		paragraphs: [
			"La persona usuaria puede solicitar acceso, rectificación o eliminación de sus datos personales, así como oponerse al tratamiento de estos, comunicándose a través de los canales de soporte de la Plataforma. House Streaming atenderá la solicitud dentro de un plazo razonable, salvo que exista una obligación legal o contractual que impida eliminar cierta información (por ejemplo, historial de pedidos con fines de garantía).",
		],
	},
	{
		title: "7. Cookies y almacenamiento local",
		paragraphs: [
			"La Plataforma utiliza almacenamiento local del navegador (localStorage) para conservar el contenido del carrito de compras. Este almacenamiento es propio del dispositivo de la persona usuaria y no se comparte con terceros.",
		],
	},
	{
		title: "8. Menores de edad",
		paragraphs: [
			"La Plataforma no está dirigida a menores de edad. Si se detecta que un menor de edad ha proporcionado datos personales sin el consentimiento de su representante legal, House Streaming procederá a eliminar dicha información.",
		],
	},
	{
		title: "9. Cambios a esta política",
		paragraphs: [
			"House Streaming podrá actualizar esta Política de Privacidad en cualquier momento. Los cambios entrarán en vigor a partir de su publicación en esta página.",
		],
	},
	{
		title: "10. Contacto",
		paragraphs: [
			"Para ejercer sus derechos o realizar consultas sobre el tratamiento de sus datos personales, la persona usuaria puede comunicarse a través de los canales de soporte disponibles en la Plataforma.",
		],
	},
];

export default function PoliticaDePrivacidadPage() {
	return (
		<div className="container mx-auto px-5 mt-24 mb-16">
			<div className="max-w-3xl">
				<h1 className="text-4xl md:text-5xl font-bold leading-tight">
					Política de Privacidad
				</h1>
				<p className="mt-4 text-sm text-muted-foreground">
					Última actualización: {LAST_UPDATED}
				</p>

				<div className="mt-10 space-y-8">
					{SECTIONS.map((section) => (
						<section key={section.title}>
							<h2 className="text-xl font-semibold">{section.title}</h2>
							<div className="mt-3 space-y-3">
								{section.paragraphs.map((paragraph) => (
									<p
										key={paragraph.slice(0, 40)}
										className="text-muted-foreground leading-relaxed"
									>
										{paragraph}
									</p>
								))}
							</div>
						</section>
					))}
				</div>
			</div>
		</div>
	);
}
