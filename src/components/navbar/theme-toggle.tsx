"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	// Evitar hydration mismatch
	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" disabled aria-hidden="true">
				<Sun className="size-5" />
			</Button>
		)
	}

	const toggleTheme = () => {
		// Usar View Transition API si está disponible
		if (document.startViewTransition) {
			document.startViewTransition(() => {
				setTheme(theme === "dark" ? "light" : "dark")
			})
		} else {
			setTheme(theme === "dark" ? "light" : "dark")
		}
	}

	const isDark = theme === "dark"

	return (
		<Button
			size="icon"
			onClick={toggleTheme}
			aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
			className="relative"
			variant="outline"
		>
			<Sun className="size-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute size-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
			<span className="sr-only">
				{isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
			</span>
		</Button>
	)
}
