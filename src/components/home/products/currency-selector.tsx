"use client"

import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import { useCurrencyStore, type Currency } from "@/stores/currency-store"

const currencies: Currency[] = ["USD", "VES"]

const currencyLabels: Record<Currency, string> = {
	USD: "USD ($)",
	VES: "VES (Bs)",
}

export function CurrencySelector() {
	const currency = useCurrencyStore((state) => state.currency)
	const setCurrency = useCurrencyStore((state) => state.setCurrency)

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm font-medium text-muted-foreground">Moneda:</span>
			<ButtonGroup>
				{currencies.map((curr) => (
					<Button
						key={curr}
						variant={currency === curr ? "default" : "outline"}
						onClick={() => setCurrency(curr)}
						className="min-w-[80px]"
					>
						{currencyLabels[curr]}
					</Button>
				))}
			</ButtonGroup>
		</div>
	)
}
