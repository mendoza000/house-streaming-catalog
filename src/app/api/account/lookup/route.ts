import { type NextRequest, NextResponse } from "next/server";
import { lookupRenewableAccounts } from "@/api/renewals";

/**
 * POST /api/account/lookup
 * Body: { phone: string }
 *
 * Devuelve las pantallas renovables asociadas a un teléfono (compras web y wabot),
 * SIN credenciales. Corre server-side con service-role porque la RLS bloquea la
 * lectura de `clients` desde el cliente anon.
 */
export async function POST(request: NextRequest) {
	try {
		const { phone } = await request.json();

		if (typeof phone !== "string" || phone.trim().length < 7) {
			return NextResponse.json(
				{ error: "Número de teléfono inválido" },
				{ status: 400 },
			);
		}

		const { data, error } = await lookupRenewableAccounts(phone.trim());
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ accounts: data ?? [] });
	} catch (error) {
		console.error("Account lookup error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
