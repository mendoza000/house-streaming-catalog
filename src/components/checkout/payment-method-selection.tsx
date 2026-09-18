"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
	const [acceptedTerms, setAcceptedTerms] = useState(false);

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

				<div className="flex items-start gap-2">
					<Checkbox
						id="checkout-accepted-terms"
						checked={acceptedTerms}
						onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
						className="mt-0.5"
					/>
					<Label
						htmlFor="checkout-accepted-terms"
						className="text-sm font-normal text-muted-foreground"
					>
						Acepto los{" "}
						<Link
							href="/terminos-y-condiciones"
							className="font-medium text-primary hover:underline"
						>
							Términos y Condiciones
						</Link>{" "}
						y la{" "}
						<Link
							href="/politica-de-privacidad"
							className="font-medium text-primary hover:underline"
						>
							Política de Privacidad
						</Link>
					</Label>
				</div>

				<Button
					size="lg"
					className="w-full"
					disabled={
						!selectedMethodId ||
						cartItems.length === 0 ||
						!isClientFormValid ||
						!acceptedTerms ||
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

				{isClientFormValid && selectedMethodId && !acceptedTerms && (
					<p className="text-center text-sm text-muted-foreground">
						Debes aceptar los Términos y Condiciones para continuar
					</p>
				)}
			</CardContent>
		</Card>
	);
}
