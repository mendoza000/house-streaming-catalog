"use client";

import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { DeliveredAccountsCard } from "@/components/orden/delivered-accounts-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderTracking } from "@/hooks/orders/use-order-tracking";

const STATUS_INFO: Record<string, { label: string; description: string }> = {
	pending: {
		label: "Pago pendiente",
		description: "Estamos esperando la confirmación de tu pago.",
	},
	validating: {
		label: "Validando pago",
		description:
			"Estamos verificando tu pago. Esta página se actualiza sola, podés dejarla abierta.",
	},
	completed: {
		label: "Completada",
		description: "Tu pago fue confirmado y tu cuenta ya está lista.",
	},
	failed: {
		label: "Pago rechazado",
		description:
			"No pudimos confirmar tu pago. Si creés que es un error, escribinos.",
	},
	cancelled: {
		label: "Cancelada",
		description: "Esta orden fue cancelada.",
	},
	draft: {
		label: "Sin finalizar",
		description: "Esta orden todavía no fue confirmada.",
	},
};

export default function OrderTrackingPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = use(params);
	const { data, isLoading, isError, error } = useOrderTracking(token);

	const wrap = (children: React.ReactNode) => (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20">
			<div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
				{children}
			</div>
		</div>
	);

	if (isLoading) {
		return wrap(
			<div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
				<Loader2 className="size-8 animate-spin" />
				<p className="text-sm">Cargando tu orden…</p>
			</div>,
		);
	}

	if (isError) {
		const notFound = error instanceof Error && error.message === "not_found";
		return wrap(
			<Card>
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
						<XCircle className="size-8 text-destructive" />
					</div>
					<CardTitle className="text-xl">
						{notFound ? "Orden no encontrada" : "Algo salió mal"}
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-6">
					<p className="text-sm text-muted-foreground">
						{notFound
							? "El link de seguimiento no es válido. Revisá que esté completo."
							: "No pudimos cargar tu orden. Probá de nuevo en unos segundos."}
					</p>
					<Link href="/">
						<Button>Ir al inicio</Button>
					</Link>
				</CardContent>
			</Card>,
		);
	}

	if (!data) return wrap(null);

	const info = STATUS_INFO[data.status ?? "pending"] ?? STATUS_INFO.pending;
	const isCompleted = data.status === "completed";
	const isFailed = data.status === "failed" || data.status === "cancelled";
	const hasAccounts = (data.delivered?.length ?? 0) > 0;

	const StatusIcon = isCompleted ? CheckCircle2 : isFailed ? XCircle : Clock;
	const iconWrapClass = isCompleted
		? "bg-primary/20 text-primary"
		: isFailed
			? "bg-destructive/10 text-destructive"
			: "bg-amber-500/10 text-amber-500";

	return wrap(
		<Card
			className={isCompleted ? "border-primary/20 bg-primary/5" : undefined}
		>
			<CardHeader className="text-center pb-2">
				<div
					className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full ${iconWrapClass}`}
				>
					<StatusIcon className="size-8" />
				</div>
				<CardTitle className="text-2xl">{info.label}</CardTitle>
				<p className="text-muted-foreground">Orden #{data.id}</p>
			</CardHeader>
			<CardContent className="space-y-6">
				<p className="text-center text-sm text-muted-foreground">
					{info.description}
				</p>

				{isCompleted && hasAccounts ? (
					<DeliveredAccountsCard accounts={data.delivered ?? []} />
				) : isCompleted && data.outOfStock ? (
					<div className="rounded-lg border bg-background p-4">
						<p className="text-sm text-muted-foreground">
							Tu pago fue confirmado, pero estamos terminando de preparar tu
							cuenta. Escribinos con tu número de orden #{data.id} si tarda.
						</p>
					</div>
				) : !isCompleted && !isFailed ? (
					<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
						<Loader2 className="size-3 animate-spin" />
						Actualizando estado automáticamente…
					</div>
				) : null}

				<div className="flex justify-center pt-2">
					<Link href="/">
						<Button variant={isCompleted ? "default" : "outline"} size="lg">
							Ir al inicio
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>,
	);
}
