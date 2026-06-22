/**
 * Cliente server-side de PayPal. Centraliza la base de la API y la obtención del
 * access token (client_credentials) para que create-order y capture-order no
 * dupliquen la lógica de auth. El secret vive solo en el server.
 */

export const PAYPAL_API_BASE =
	process.env.NODE_ENV === "production"
		? "https://api-m.paypal.com"
		: "https://api-m.sandbox.paypal.com";

export async function getPayPalAccessToken(): Promise<string> {
	const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
	const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error("PayPal credentials not configured");
	}

	const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

	const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${auth}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "grant_type=client_credentials",
	});

	if (!response.ok) {
		throw new Error("Failed to get PayPal access token");
	}

	const data = await response.json();
	return data.access_token;
}
