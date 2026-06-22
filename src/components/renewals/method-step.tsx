"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PaymentMethodCard } from "@/components/checkout/payment-method-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYMENT_METHODS } from "@/constants/payment-methods";
import { useExchangeRate } from "@/hooks/exchange-rate/use-exchange-rate";
import { useCreateRenewal } from "@/hooks/renewals/use-create-renewal";
import type { CartItem } from "@/stores/cart-store";
import type {
	RenewableAccount,
	RenewalCreatedPayload,
	RenewalSelection,
} from "@/types/renewal-types";
import { formatPrice } from "@/utils/currency";
import { getMethodSettlement } from "@/utils/settlement";

interface MethodStepProps {
	phone: string;
	accounts: RenewableAccount[];
	selections: RenewalSelection[];
	onCreated: (payload: RenewalCreatedPayload) => void;
	onBack: () => void;
}

/** Construye los ítems "pseudo-carrito" para reusar getMethodSettlement. */
function toPseudoItems(
	accounts: RenewableAccount[],
	selections: RenewalSelection[],
): CartItem[] {
	const byClientId = new Map(accounts.map((a) => [a.client_id, a]));
	const items: CartItem[] = [];
	for (const sel of selections) {
		const acc = byClientId.get(sel.client_id);
		if (!acc) continue;
		items.push({
			id: String(acc.service_id),
			title: acc.service,
			price: acc.screen_price,
			accounts: 1,
			quantity: 1,
			months: sel.months,
		});
	}
	return items;
}

/**
 * Paso 3: el cliente elige el método de pago. Al continuar se crea la orden de
 * renovación server-side y se pasa al pago.
 */
export function MethodStep({
	phone,
	accounts,
	selections,
	onCreated,
	onBack,
}: MethodStepProps) {
	const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

	const { data: exchangeRate } = useExchangeRate();
	const { create, isLoading, error } = useCreateRenewal();

	const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId);
	const pseudoItems = toPseudoItems(accounts, selections);

	const subtotalUsd = pseudoItems.reduce(
		(total, item) => total + item.price * item.months,
		0,
	);

	const settlement = selectedMethod
		? getMethodSettlement(selectedMethod, pseudoItems, exchangeRate)
		: null;

	const handleContinue = async () => {
		if (!selectedMethod || !settlement) return;

		const created = await create({
			phone,
			selections,
			methodId: selectedMethod.id,
		});

		if (created) {
			onCreated({
				method: selectedMethod,
				settlement,
				orderId: created.orderId,
				trackingToken: created.trackingToken,
			});
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Método de pago</CardTitle>
					<p className="text-sm text-muted-foreground">
						Elige cómo quieres pagar tu renovación.
					</p>
				</CardHeader>
				<CardContent className="space-y-3">
					{PAYMENT_METHODS.map((method) => (
						<PaymentMethodCard
							key={method.id}
							method={method}
							isSelected={selectedMethodId === method.id}
							onSelect={() => setSelectedMethodId(method.id)}
						/>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardContent className="space-y-4 pt-6">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Subtotal</span>
						<span className="font-medium">
							{formatPrice(subtotalUsd, "USD")}
						</span>
					</div>
					{settlement && settlement.currency !== "USD" && (
						<div className="flex items-center justify-between">
							<span className="text-sm font-semibold text-primary">
								Total a pagar
							</span>
							<span className="text-xl font-bold text-primary">
								{formatPrice(settlement.total, settlement.currency)}
							</span>
						</div>
					)}

					{error && (
						<div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					<div className="flex gap-3">
						<Button variant="outline" onClick={onBack} className="flex-1">
							Volver
						</Button>
						<Button
							onClick={handleContinue}
							disabled={!selectedMethod || isLoading}
							className="flex-1"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									Creando…
								</>
							) : (
								"Continuar con el pago"
							)}
						</Button>
					</div>

					{!selectedMethod && (
						<p className="text-center text-sm text-muted-foreground">
							Selecciona un método de pago para continuar
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
