import { type NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Genera el link de recuperación vía Admin API (`generateLink`) y lo manda
 * nosotros mismos con Resend, en vez de dejar que Supabase Auth lo envíe con
 * su SMTP interno (limitado, no apto para producción).
 *
 * Siempre responde 200 con { ok: true }, exista o no el email — evita
 * enumeración de usuarios. El front (`/cuenta/recuperar`) ya asume esto y
 * muestra un mensaje genérico sin importar el resultado.
 */
export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email || typeof email !== "string") {
			return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
		}

		const normalizedEmail = email.trim().toLowerCase();
		const origin = new URL(request.url).origin;

		const { data, error } = await supabaseAdmin.auth.admin.generateLink({
			type: "recovery",
			email: normalizedEmail,
			options: { redirectTo: `${origin}/cuenta/nueva-password` },
		});

		if (error || !data.properties?.action_link) {
			console.error("forgot-password generateLink error:", error?.message);
			return NextResponse.json({ ok: true });
		}

		const fromAddress = process.env.MAIL_FROM_ADDRESS;
		const fromName = process.env.MAIL_FROM_NAME;

		if (!fromAddress || !fromName) {
			throw new Error(
				"Missing MAIL_FROM_ADDRESS or MAIL_FROM_NAME env variables",
			);
		}

		const { error: sendError } = await resend.emails.send({
			from: `${fromName} <${fromAddress}>`,
			to: normalizedEmail,
			subject: "Recuperá tu contraseña",
			html: `
				<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
					<h2>Recuperá tu contraseña</h2>
					<p>Recibimos un pedido para elegir una nueva contraseña en House Streaming.</p>
					<p>
						<a href="${data.properties.action_link}" style="display: inline-block; padding: 12px 24px; background: #6d28d9; color: #fff; text-decoration: none; border-radius: 6px;">
							Elegir nueva contraseña
						</a>
					</p>
					<p>Si no pediste esto, podés ignorar este correo.</p>
				</div>
			`,
		});

		if (sendError) {
			console.error("forgot-password resend error:", sendError.message);
			return NextResponse.json(
				{ error: "No se pudo enviar el correo" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("forgot-password error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
