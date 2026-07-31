import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/account/credentials
 * Header: Authorization: Bearer <access_token>
 *
 * Devuelve las cuentas de streaming del cliente autenticado. Corre server-side
 * con service-role (mismo criterio que /api/account/lookup): `clients`, `sales`
 * y `accounts` no tienen RLS para `authenticated`, así que el filtrado por
 * ownership pasa por acá, no por Postgres.
 *
 * Solo se devuelven mail/password de pantallas VIGENTES (expires_at futuro). Si
 * venció, se devuelve únicamente la fecha de corte — evita mostrar credenciales
 * de un slot que ya pudo haber sido reasignado a otro cliente por wabot-v3.
 */
export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");
		const token = authHeader?.match(/^Bearer (.+)$/)?.[1];
		if (!token) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const {
			data: { user },
			error: userError,
		} = await supabaseAdmin.auth.getUser(token);

		if (userError || !user?.email || !user.email_confirmed_at) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const email = user.email.trim().toLowerCase();

		const { data: orders, error: ordersError } = await supabaseAdmin
			.from("orders")
			.select("id")
			.eq("client_email", email)
			.eq("status", "completed");

		if (ordersError) {
			console.error("Account credentials orders error:", ordersError);
			return NextResponse.json({ error: ordersError.message }, { status: 500 });
		}

		const orderIds = (orders ?? []).map((o) => o.id);
		if (orderIds.length === 0) {
			return NextResponse.json({ accounts: [] });
		}

		const { data: sales, error: salesError } = await supabaseAdmin
			.from("sales")
			.select(
				"order_id, clients(screen, expires_at, is_reseller_customer), accounts(mail, password, services(comercial_name))",
			)
			.in("order_id", orderIds);

		if (salesError) {
			console.error("Account credentials sales error:", salesError);
			return NextResponse.json({ error: salesError.message }, { status: 500 });
		}

		const now = Date.now();
		const accounts = (sales ?? [])
			.filter((row) => row.clients && !row.clients.is_reseller_customer)
			.map((row) => {
				const expiresAt = row.clients?.expires_at ?? null;
				const isActive = expiresAt
					? new Date(expiresAt).getTime() >= now
					: false;

				return {
					service: row.accounts?.services?.comercial_name ?? "Servicio",
					screen: row.clients?.screen ?? null,
					expiresAt,
					isActive,
					mail: isActive ? (row.accounts?.mail ?? null) : null,
					password: isActive ? (row.accounts?.password ?? null) : null,
				};
			});

		return NextResponse.json({ accounts });
	} catch (error) {
		console.error("Account credentials error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
