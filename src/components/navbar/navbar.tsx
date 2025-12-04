"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { Cart } from "./cart"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const LINKS = [
	{ href: "/", label: "Inicio" },
	{ href: "/nosotros", label: "Quiénes somos" },
	{ href: "/contacto", label: "Contacto" },
]

export default function Navbar() {
	const [open, setOpen] = useState(false)

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-background px-5 py-2 border-b-2">
			<div className="flex items-center justify-between container mx-auto">
				<div className="flex items-center gap-8">
					<Link href="/">
						<strong>House Streaming</strong>
					</Link>
					{/* Enlaces desktop */}
					<div className="hidden md:flex gap-8">
						{LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="hover:underline"
							>
								{link.label}
							</Link>
						))}
					</div>
				</div>

				<div className="flex items-center gap-4">
					<Cart />
					{/* ThemeToggle solo en desktop */}
					<div className="hidden md:block">
						<ThemeToggle />
					</div>

					{/* Menú móvil */}
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild className="md:hidden">
							<Button variant="outline" size="icon">
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-full p-0">
							<SheetHeader className="p-6 border-b">
								<SheetTitle>Menú</SheetTitle>
							</SheetHeader>
							<div className="flex flex-col h-full">
								<div className="flex flex-col gap-1 p-4">
									{LINKS.map((link) => (
										<Link
											key={link.href}
											href={link.href}
											className="px-4 py-3 hover:bg-accent rounded-md transition-colors"
											onClick={() => setOpen(false)}
										>
											{link.label}
										</Link>
									))}
								</div>
								<div className="mt-auto p-6 border-t">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Tema</span>
										<ThemeToggle />
									</div>
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</nav>
	)
}
