import { ImageResponse } from "next/og"

export const alt = "House Streaming — Cuentas de streaming al mejor precio"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				justifyContent: "center",
				padding: "80px",
				background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
				color: "#fff",
			}}
		>
			<div style={{ fontSize: 80, fontWeight: 800, display: "flex" }}>
				House Streaming
			</div>
			<div
				style={{
					fontSize: 40,
					marginTop: 24,
					color: "#a1a1aa",
					display: "flex",
				}}
			>
				Cuentas de streaming al mejor precio
			</div>
			<div
				style={{
					fontSize: 28,
					marginTop: 48,
					color: "#71717a",
					display: "flex",
				}}
			>
				Netflix · Disney+ · HBO Max · Spotify · y más
			</div>
		</div>,
		size,
	)
}
