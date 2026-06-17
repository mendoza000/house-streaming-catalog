"use client";

import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	type PaymentValidationInput,
	usePaymentValidation,
} from "@/hooks/orders/use-payment-validation";
import type { DeliveredAccount } from "@/types/delivery";

interface PaymentValidationStepProps {
	input: PaymentValidationInput;
	/** Se llama cuando el admin aprobó el pago, con lo entregado. */
	onApproved: (delivered: DeliveredAccount[]) => void;
}

export function PaymentValidationStep({
	input,
	onApproved,
}: PaymentValidationStepProps) {
	const { phase, delivered, start } = usePaymentValidation();

	// Iniciar la validación una sola vez.
	const startedRef = useRef(false);
	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;
		start(input);
	}, [start, input]);

	// Al aprobar, avisar al padre con las credenciales entregadas.
	const notifiedRef = useRef(false);
	useEffect(() => {
		if (phase === "approved" && !notifiedRef.current) {
			notifiedRef.current = true;
			onApproved(delivered);
		}
	}, [phase, delivered, onApproved]);

	const isRejected = phase === "rejected";
	const isTimeout = phase === "timeout";
	const isError = phase === "error";

	return (
		<Card className="border-muted bg-muted/5">
			<CardHeader className="text-center pb-2">
				<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-500/10">
					{isRejected || isError ? (
						<XCircle className="size-8 text-destructive" />
					) : isTimeout ? (
						<Clock className="size-8 text-muted-foreground" />
					) : (
						<Loader2 className="size-8 text-amber-500 animate-spin" />
					)}
				</div>
				<CardTitle className="text-2xl">
					{isRejected
						? "Pago no validado"
						: isTimeout
							? "Validación en curso"
							: isError
								? "No pudimos iniciar la validación"
								: "Validando tu pago…"}
				</CardTitle>
				<p className="text-muted-foreground">
					{isRejected
						? "No pudimos verificar tu comprobante. Escribinos para resolverlo."
						: isTimeout
							? "Está tardando más de lo normal. Te avisamos por WhatsApp apenas se confirme."
							: isError
								? "Intentá de nuevo en unos minutos."
								: "Estamos verificando tu comprobante con el equipo, esto puede tomar unos minutos."}
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{!isRejected && !isError && (
					<div className="space-y-2">
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Estado</span>
							<span>
								{isTimeout ? "En revisión" : "Esperando confirmación"}
							</span>
						</div>
						<Progress value={isTimeout ? 60 : 45} className="h-2" />
					</div>
				)}

				<div className="rounded-lg border border-border bg-background p-4">
					<div className="flex items-start gap-3">
						{phase === "validating" ? (
							<Clock className="size-5 text-muted-foreground mt-0.5" />
						) : (
							<CheckCircle2 className="size-5 text-muted-foreground mt-0.5" />
						)}
						<div className="space-y-1">
							<p className="font-medium text-sm">¿Qué pasa ahora?</p>
							<p className="text-xs text-muted-foreground">
								Un agente revisa tu comprobante. Cuando lo confirme, tu cuenta
								se entrega automáticamente y también te llega por WhatsApp.
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
