import { NextResponse } from "next/server";
import { fetchProviderStock } from "@/lib/provider-stock/client";

/**
 * GET /api/provider-stock
 *
 * Devuelve el stock de los productos bajo pedido servido desde la Supabase del
 * proveedor, como un mapa { comercial_name normalizado: stock }. La key del
 * proveedor se resuelve del lado server (ver provider-stock/client).
 */
export async function GET() {
	const { data, error } = await fetchProviderStock();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(data);
}
