import type { Metadata } from "next";

// Generic draft — must be reviewed by a lawyer before this ships to production.
export const metadata: Metadata = {
	title: "Términos y Condiciones",
	description:
		"Términos y condiciones de uso del catálogo y la tienda de House Streaming.",
};

const LAST_UPDATED = "17 de septiembre de 2026";

const SECTIONS = [
	{
		title: "1. Aceptación de los términos",
		paragraphs: [
			'Estos Términos y Condiciones ("los Términos") regulan el uso del sitio web y los servicios ofrecidos por House Streaming (en adelante, "la Plataforma"). Al crear una cuenta, realizar una compra o utilizar la Plataforma de cualquier forma, la persona usuaria declara haber leído, entendido y aceptado estos Términos en su totalidad. Si no está de acuerdo con alguna parte de este documento, debe abstenerse de utilizar la Plataforma.',
		],
	},
	{
		title: "2. Naturaleza del servicio",
		paragraphs: [
			"House Streaming comercializa accesos a cuentas y perfiles de plataformas de streaming y entretenimiento digital de terceros (a modo de ejemplo: Netflix, Disney+, HBO Max, Prime Video, Spotify, YouTube Premium, entre otras). House Streaming no es propietario, representante, distribuidor autorizado ni está afiliado a dichas plataformas; únicamente actúa como intermediario en la gestión y reventa de accesos.",
			"Debido a que el servicio depende de plataformas de terceros ajenas al control de House Streaming, la disponibilidad, el precio, las funcionalidades y las políticas de uso de cada servicio pueden cambiar sin previo aviso por decisión del proveedor original.",
		],
	},
	{
		title: "3. Cuentas de usuario",
		paragraphs: [
			"Para realizar compras y acceder al historial de pedidos, la persona usuaria puede crear una cuenta con su correo electrónico. Es responsabilidad de la persona usuaria mantener la confidencialidad de sus credenciales de acceso y notificar a House Streaming de inmediato ante cualquier uso no autorizado de su cuenta.",
			"La información proporcionada durante el registro y la compra (nombre, correo electrónico, teléfono) debe ser veraz, exacta y estar actualizada. House Streaming se reserva el derecho de suspender cuentas que proporcionen información falsa o incompleta.",
		],
	},
	{
		title: "4. Proceso de compra y estados del pedido",
		paragraphs: [
			"Toda compra pasa por los siguientes estados: borrador (mientras se completa el checkout), pendiente (orden creada, pago no confirmado), en validación (comprobante de pago recibido y en revisión manual, aplicable a Pago Móvil), completada (pago confirmado y credenciales entregadas), fallida o cancelada.",
			"House Streaming se reserva el derecho de rechazar o cancelar un pedido cuando existan indicios razonables de fraude, error en el precio publicado, falta de disponibilidad del servicio contratado o incumplimiento de estos Términos.",
		],
	},
	{
		title: "5. Métodos de pago",
		paragraphs: [
			"La Plataforma acepta pagos mediante PayPal, Binance Pay y Pago Móvil. Los pagos realizados por PayPal y Binance Pay se validan de forma automática. Los pagos por Pago Móvil requieren que la persona usuaria cargue un comprobante, el cual queda sujeto a revisión manual antes de confirmar el pedido.",
			"House Streaming no almacena datos completos de tarjetas ni credenciales bancarias; el procesamiento de pagos automáticos es gestionado directamente por los proveedores correspondientes (PayPal, Binance).",
		],
	},
	{
		title: "6. Entrega del servicio",
		paragraphs: [
			"Una vez confirmado el pago, las credenciales o accesos se entregan de forma automática o, en el caso de servicios sujetos a disponibilidad, tras la verificación correspondiente. Los tiempos de entrega pueden variar según el método de pago y el servicio contratado.",
		],
	},
	{
		title: "7. Garantía y soporte",
		paragraphs: [
			"House Streaming ofrece soporte para incidencias relacionadas con el acceso entregado durante el período de vigencia contratado. Debido a que los servicios dependen de plataformas de terceros, House Streaming no garantiza la disponibilidad ininterrumpida del servicio ni es responsable por suspensiones, cambios de contraseña o restricciones aplicadas directamente por el proveedor original ajenas a su control, aunque hará su mejor esfuerzo por resolver o reponer el acceso cuando corresponda.",
			"Cualquier reclamo debe realizarse a través de los canales de soporte oficiales de House Streaming durante el período de vigencia del servicio contratado.",
		],
	},
	{
		title: "8. Política de reembolsos",
		paragraphs: [
			"Los reembolsos se evalúan caso por caso y proceden principalmente ante fallas atribuibles a House Streaming, como la no entrega del servicio contratado. No se realizan reembolsos por cambio de opinión una vez entregado el acceso, ni por mal uso de las credenciales por parte de la persona usuaria.",
		],
	},
	{
		title: "9. Uso permitido",
		paragraphs: [
			"Las credenciales y accesos entregados son para uso personal de la persona usuaria y de los perfiles autorizados según el plan adquirido. Queda prohibida la reventa, distribución o uso comercial no autorizado de los accesos entregados por House Streaming.",
		],
	},
	{
		title: "10. Limitación de responsabilidad",
		paragraphs: [
			"En la máxima medida permitida por la ley aplicable, House Streaming no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de la Plataforma o de los servicios de terceros contratados a través de ella.",
		],
	},
	{
		title: "11. Modificaciones",
		paragraphs: [
			"House Streaming podrá actualizar estos Términos en cualquier momento. Los cambios entrarán en vigor a partir de su publicación en esta página. El uso continuado de la Plataforma después de una actualización implica la aceptación de los Términos modificados.",
		],
	},
	{
		title: "12. Contacto",
		paragraphs: [
			"Para consultas relacionadas con estos Términos, la persona usuaria puede comunicarse a través de los canales de soporte disponibles en la Plataforma.",
		],
	},
];

export default function TerminosYCondicionesPage() {
	return (
		<div className="container mx-auto px-5 mt-24 mb-16">
			<div className="max-w-3xl">
				<h1 className="text-4xl md:text-5xl font-bold leading-tight">
					Términos y Condiciones
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
