"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentMethod } from "@/constants/payment-methods";
import { useVerifyBinancePayment } from "@/hooks/orders/use-verify-binance-payment";
import type { DeliveredAccount } from "@/types/delivery";

interface BinancePaymentStepProps {
	method: PaymentMethod;
	orderId: number;
	/** Se llama SOLO cuando el server confirmó el pago, con lo entregado. */
	onVerify: (delivered: DeliveredAccount[]) => void;
	onBack: () => void;
	/** Opcional: aviso de que expiró el tiempo (no completa la orden). */
	onTimeout?: () => void;
}

/** Cada cuánto consultamos a Binance en segundo plano. Weight alto → no bajar de ~15s. */
const POLL_INTERVAL_MS = 15_000;

export function BinancePaymentStep({
	method,
	orderId,
	onVerify,
	onBack,
	onTimeout,
}: BinancePaymentStepProps) {
	const initialTime = method.verificationTimeSeconds ?? 300;
	const [timeLeft, setTimeLeft] = useState(initialTime);
	const [expired, setExpired] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	const { verify, isVerifying } = useVerifyBinancePayment();

	const orderCode = `ord-${orderId}`;

	const formatTime = useCallback((seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}, []);

	const runVerify = useCallback(
		async (silent: boolean) => {
			if (!silent) setStatusMessage(null);

			const result = await verify(orderId);

			if (result?.matched) {
				onVerify(result.delivered ?? []);
				return;
			}

			// En modo silencioso (auto-poll) no molestamos con mensajes.
			if (!silent) {
				setStatusMessage(
					result === null
						? "No pudimos verificar el pago. Probá de nuevo en unos segundos."
						: "Aún no detectamos tu pago. Si ya pagaste, esperá unos segundos y volvé a verificar.",
				);
			}
		},
		[verify, orderId, onVerify],
	);

	// Ref estable para que los intervals siempre llamen a la última versión.
	const runVerifyRef = useRef(runVerify);
	runVerifyRef.current = runVerify;

	// Cuenta regresiva. Al llegar a 0 NO se valida nada: solo marca expirado.
	useEffect(() => {
		if (expired) return;

		if (timeLeft <= 0) {
			setExpired(true);
			onTimeout?.();
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft, expired, onTimeout]);

	// Auto-poll a Binance mientras el contador corre.
	useEffect(() => {
		if (expired) return;

		const poll = setInterval(() => {
			runVerifyRef.current(true);
		}, POLL_INTERVAL_MS);

		return () => clearInterval(poll);
	}, [expired]);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-xl">Pago con Binance Pay</CardTitle>
					<div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
						<span className="text-sm font-medium">Tiempo restante:</span>
						<span className="font-mono text-lg font-bold text-primary">
							{expired ? "Expirado" : formatTime(timeLeft)}
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* QR Code */}
				<div className="flex flex-col items-center gap-4">
					<div className="relative size-48 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted">
						{method.binanceInfo?.qrCodeUrl ? (
							<Image
								src={method.binanceInfo.qrCodeUrl}
								alt="Binance Pay QR Code"
								fill
								className="object-contain p-2"
							/>
						) : (
							<div className="flex size-full items-center justify-center text-muted-foreground">
								<span className="text-4xl">₿</span>
							</div>
						)}
					</div>
					<p className="text-sm text-muted-foreground">
						Escanea el código QR con tu app de Binance
					</p>
				</div>

				{/* Binance ID */}
				<div className="rounded-lg bg-muted p-4 space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">Binance ID:</span>
						<span className="font-mono font-semibold">
							{method.binanceInfo?.binanceId ?? "N/A"}
						</span>
					</div>
				</div>

				{/* Important Note */}
				<div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
					<p className="text-sm font-medium text-amber-600 dark:text-amber-400">
						⚠️ Importante
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						En la nota de Binance Pay, coloca el número de orden:{" "}
						<span className="font-mono font-bold text-foreground">
							{orderCode}
						</span>
						. Sin esta nota no podremos confirmar tu pago automáticamente.
					</p>
				</div>

				{/* Status / feedback */}
				{expired && (
					<div className="rounded-lg border border-muted-foreground/30 bg-muted p-4">
						<p className="text-sm text-muted-foreground">
							El tiempo para pagar expiró. Si ya realizaste el pago, podés
							verificarlo igualmente; si no, volvé y reiniciá el proceso.
						</p>
					</div>
				)}

				{statusMessage && (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
						<p className="text-sm text-destructive">{statusMessage}</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-3">
					<Button variant="outline" onClick={onBack} className="flex-1">
						Volver
					</Button>
					<Button
						onClick={() => runVerify(false)}
						disabled={isVerifying}
						className="flex-1"
					>
						{isVerifying ? "Verificando..." : "Ya realicé el pago, verificar"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
