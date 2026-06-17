"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type AvailabilityClient,
	type AvailabilityItem,
	useAvailabilityCheck,
} from "@/hooks/orders/use-availability-check";

interface AvailabilityCheckStepProps {
	items: AvailabilityItem[];
	client: AvailabilityClient;
	onAllAvailable: () => void;
	onBack: () => void;
}

export function AvailabilityCheckStep({
	items,
	client,
	onAllAvailable,
	onBack,
}: AvailabilityCheckStepProps) {
	const { phase, results, start } = useAvailabilityCheck();

	// Arrancar la consulta una sola vez.
	const startedRef = useRef(false);
	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;
		start(items, client);
	}, [start, items, client]);

	const rows =
		results.length > 0
			? results
			: items.map((i) => ({ ...i, status: "pending" as const }));

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Consultando disponibilidad</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<p className="text-sm text-muted-foreground">
					Algunos servicios son bajo pedido. Estamos confirmando disponibilidad
					con el equipo, puede tardar unos minutos.
				</p>

				<ul className="space-y-2">
					{rows.map((r) => (
						<li
							key={r.serviceId}
							className="flex items-center justify-between rounded-lg border p-3 text-sm"
						>
							<span className="font-medium">{r.title}</span>
							{r.status === "pending" && (
								<span className="flex items-center gap-2 text-muted-foreground">
									<Loader2 className="size-4 animate-spin" />
									Consultando…
								</span>
							)}
							{r.status === "available" && (
								<span className="flex items-center gap-2 text-primary">
									<CheckCircle2 className="size-4" />
									Disponible
								</span>
							)}
							{(r.status === "not_available" || r.status === "error") && (
								<span className="flex items-center gap-2 text-destructive">
									<XCircle className="size-4" />
									{r.status === "error" ? "Error" : "No disponible"}
								</span>
							)}
						</li>
					))}
				</ul>

				{phase === "all_available" && (
					<div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
						<p className="text-sm text-primary">
							¡Todo disponible! Podés continuar con el pago.
						</p>
					</div>
				)}

				{phase === "some_unavailable" && (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
						<p className="text-sm text-destructive">
							Algunos servicios no están disponibles ahora. Quitalos del carrito
							para continuar, o probá más tarde.
						</p>
					</div>
				)}

				{phase === "timeout" && (
					<div className="rounded-lg border border-muted-foreground/30 bg-muted p-3">
						<p className="text-sm text-muted-foreground">
							Estamos tardando en confirmar. Dejanos tu pedido y te avisamos
							apenas tengamos respuesta.
						</p>
					</div>
				)}

				{phase === "error" && (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
						<p className="text-sm text-destructive">
							No pudimos iniciar la consulta. Intentá de nuevo en unos minutos.
						</p>
					</div>
				)}

				<div className="flex gap-3">
					<Button variant="outline" onClick={onBack} className="flex-1">
						Volver
					</Button>
					{phase === "all_available" && (
						<Button onClick={onAllAvailable} className="flex-1">
							Continuar con el pago
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
