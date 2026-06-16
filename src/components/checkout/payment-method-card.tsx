"use client"

import { Badge } from "@/components/ui/badge"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import type { PaymentMethod } from "@/constants/payment-methods"

interface PaymentMethodCardProps {
	method: PaymentMethod
	isSelected: boolean
	onSelect: () => void
}

export function PaymentMethodCard({
	method,
	isSelected,
	onSelect,
}: PaymentMethodCardProps) {
	return (
		<Card
			className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
				isSelected ? "border-primary ring-2 ring-primary/20" : ""
			}`}
			onClick={onSelect}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl">
							{method.icon}
						</div>
						<div>
							<CardTitle className="text-lg">{method.name}</CardTitle>
							<CardDescription className="text-sm">
								{method.description}
							</CardDescription>
						</div>
					</div>
					<Badge
						variant={method.type === "automatic" ? "default" : "secondary"}
						className="shrink-0"
					>
						{method.type === "automatic" ? "Automático" : "Manual"}
					</Badge>
				</div>
			</CardHeader>
		</Card>
	)
}
