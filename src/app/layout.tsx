import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import Navbar from "@/components/navbar/navbar"
import { Footer } from "@/components/footer/footer"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "House Streaming — Cuentas de streaming al mejor precio",
		template: "%s | House Streaming",
	},
	description:
		"Comprá cuentas de Netflix, Disney+, HBO Max, Spotify y más al mejor precio. Entrega automática, pago con PayPal, Binance Pay o Pago Móvil.",
	keywords: [
		"streaming",
		"Netflix",
		"Disney Plus",
		"HBO Max",
		"Spotify",
		"cuentas streaming",
		"House Streaming",
	],
	applicationName: "House Streaming",
	openGraph: {
		type: "website",
		locale: "es_ES",
		url: siteUrl,
		siteName: "House Streaming",
		title: "House Streaming — Cuentas de streaming al mejor precio",
		description:
			"Comprá cuentas de Netflix, Disney+, HBO Max, Spotify y más al mejor precio. Entrega automática y pago seguro.",
	},
	twitter: {
		card: "summary_large_image",
		title: "House Streaming — Cuentas de streaming al mejor precio",
		description:
			"Comprá cuentas de Netflix, Disney+, HBO Max, Spotify y más al mejor precio. Entrega automática y pago seguro.",
	},
	robots: {
		index: true,
		follow: true,
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<QueryProvider>
						<Navbar />
						{children}
						<Footer />
						<Toaster />
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
