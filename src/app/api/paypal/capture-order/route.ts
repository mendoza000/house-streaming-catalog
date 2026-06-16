import { NextRequest, NextResponse } from "next/server"

const PAYPAL_API_BASE =
	process.env.NODE_ENV === "production"
		? "https://api-m.paypal.com"
		: "https://api-m.sandbox.paypal.com"

async function getAccessToken(): Promise<string> {
	const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
	const clientSecret = process.env.PAYPAL_CLIENT_SECRET

	if (!clientId || !clientSecret) {
		throw new Error("PayPal credentials not configured")
	}

	const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

	const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${auth}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "grant_type=client_credentials",
	})

	if (!response.ok) {
		throw new Error("Failed to get PayPal access token")
	}

	const data = await response.json()
	return data.access_token
}

export async function POST(request: NextRequest) {
	try {
		const { orderId } = await request.json()

		if (!orderId || typeof orderId !== "string") {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
		}

		const accessToken = await getAccessToken()

		const response = await fetch(
			`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			},
		)

		if (!response.ok) {
			const error = await response.json()
			return NextResponse.json(
				{ error: "Failed to capture PayPal payment", details: error },
				{ status: 500 },
			)
		}

		const captureData = await response.json()
		return NextResponse.json(captureData)
	} catch (error) {
		console.error("PayPal capture error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}
