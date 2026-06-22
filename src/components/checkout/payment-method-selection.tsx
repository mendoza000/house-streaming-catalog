"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYMENT_METHODS } from "@/constants/payment-methods";
import type { CartItem } from "@/stores/cart-store";
import { PaymentMethodCard } from "./payment-method-card";

interface PaymentMethodSelectionProps {
	selectedMethodId: string | null;
	onSelect: (methodId: string) => void;
	onContinue: () => void;
	cartItems: CartItem[];
	isClientFormValid: boolean;
	isCreatingOrder: boolean;
	hasCreateOrderError: boolean;
}

/** Paso 1 del checkout: elegir método de pago y continuar. */
export function PaymentMethodSelection({
	selectedMethodId,
	onSelect,
	onContinue,
	cartItems,
	isClientFormValid,
	isCreatingOrder,
	hasCreateOrderError,
}: PaymentMethodSelectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Selecciona un método de pago</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					{PAYMENT_METHODS.map((method) => (
						<PaymentMethodCard
							key={method.id}
							method={method}
							isSelected={selectedMethodId === method.id}
							onSelect={() => onSelect(method.id)}
						/>
					))}
				</div>

				{hasCreateOrderError && (
					<div className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3">
						<AlertCircle className="size-4 text-destructive shrink-0" />
						<p className="text-sm text-destructive">
							Error al crear la orden. Por favor, intenta de nuevo.
						</p>
					</div>
				)}

				<Button
					size="lg"
					className="w-full"
					disabled={
						!selectedMethodId ||
						cartItems.length === 0 ||
						!isClientFormValid ||
						isCreatingOrder
					}
					onClick={onContinue}
				>
					{isCreatingOrder ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Creando orden...
						</>
					) : (
						"Continuar con el pago"
					)}
				</Button>

				{!selectedMethodId && cartItems.length > 0 && isClientFormValid && (
					<p className="text-center text-sm text-muted-foreground">
						Selecciona un método de pago para continuar
					</p>
				)}

				{!isClientFormValid && cartItems.length > 0 && (
					<p className="text-center text-sm text-muted-foreground">
						Completa tus datos para continuar
					</p>
				)}
			</CardContent>
		</Card>
	);
}
