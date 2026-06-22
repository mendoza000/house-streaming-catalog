"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { RenewableAccount, RenewalSelection } from "@/types/renewal-types";
import { formatPrice } from "@/utils/currency";
import { EXPIRY_LABEL, formatExpiry, getExpiryStatus } from "@/utils/expiry";

/** Opciones de meses a renovar. */
const MONTH_OPTIONS = [1, 2, 3, 6, 12];

interface SelectStepProps {
	accounts: RenewableAccount[];
	onContinue: (selections: RenewalSelection[]) => void;
	onBack: () => void;
}

/**
 * Paso 2: el cliente elige qué pantallas renovar y por cuántos meses. La elección
 * del método de pago vive en el paso siguiente.
 */
export function SelectStep({ accounts, onContinue, onBack }: SelectStepProps) {
	// client_id -> meses elegidos. Ausencia = no seleccionado.
	const [selections, setSelections] = useState<Map<number, number>>(new Map());

	const subtotalUsd = accounts.reduce((total, acc) => {
		const months = selections.get(acc.client_id);
		return months ? total + acc.screen_price * months : total;
	}, 0);

	const toggle = (clientId: number) => {
		setSelections((prev) => {
			const next = new Map(prev);
			if (next.has(clientId)) next.delete(clientId);
			else next.set(clientId, 1);
			return next;
		});
	};

	const setMonths = (clientId: number, months: number) => {
		setSelections((prev) => {
			const next = new Map(prev);
			next.set(clientId, months);
			return next;
		});
	};

	const hasSelection = selections.size > 0;

	const handleContinue = () => {
		if (!hasSelection) return;
		const sels: RenewalSelection[] = Array.from(selections.entries()).map(
			([client_id, months]) => ({ client_id, months }),
		);
		onContinue(sels);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Elige qué renovar</CardTitle>
					<p className="text-sm text-muted-foreground">
						Marca las cuentas que quieres renovar y por cuántos meses.
					</p>
				</CardHeader>
				<CardContent className="space-y-3">
					{accounts.map((acc) => {
						const months = selections.get(acc.client_id);
						const isSelected = months != null;
						const status = getExpiryStatus(acc.expires_at);
						const badge = status !== "none" ? EXPIRY_LABEL[status] : null;
						const lineTotal = acc.screen_price * (months ?? 1);

						return (
							<div
								key={acc.client_id}
								className={`flex flex-col gap-3 rounded-lg border p-4 transition-all ${
									isSelected ? "border-primary ring-2 ring-primary/20" : ""
								}`}
							>
								{/* El toggle es un button real; el Select (botón) queda como
								    HERMANO, no anidado, evitando botones anidados. */}
								<button
									type="button"
									aria-pressed={isSelected}
									onClick={() => toggle(acc.client_id)}
									className="flex w-full cursor-pointer items-start justify-between gap-3 text-left"
								>
									<div className="flex items-start gap-3">
										<span
											className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
												isSelected
													? "border-primary bg-primary text-primary-foreground"
													: "border-muted-foreground/40"
											}`}
										>
											{isSelected && "✓"}
										</span>
										<div>
											<p className="font-semibold">
												{acc.service}{" "}
												<span className="font-normal text-muted-foreground">
													· Pantalla {acc.screen}
												</span>
											</p>
											{acc.expires_at && (
												<p className="text-xs text-muted-foreground">
													Vence el {formatExpiry(acc.expires_at)}
												</p>
											)}
										</div>
									</div>
									{badge && (
										<Badge className={`shrink-0 border-0 ${badge.className}`}>
											{badge.label}
										</Badge>
									)}
								</button>

								{isSelected && (
									<div className="flex items-center justify-between gap-3 border-t pt-3">
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">
												Meses:
											</span>
											<Select
												value={String(months)}
												onValueChange={(v) =>
													setMonths(acc.client_id, Number(v))
												}
											>
												<SelectTrigger size="sm">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{MONTH_OPTIONS.map((m) => (
														<SelectItem key={m} value={String(m)}>
															{m} {m === 1 ? "mes" : "meses"}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<span className="font-semibold">
											{formatPrice(lineTotal, "USD")}
										</span>
									</div>
								)}
							</div>
						);
					})}
				</CardContent>
			</Card>

			<Card>
				<CardContent className="space-y-4 pt-6">
					<div className="flex items-center justify-between">
						<span className="text-sm text-muted-foreground">
							Subtotal ({selections.size}{" "}
							{selections.size === 1 ? "cuenta" : "cuentas"})
						</span>
						<span className="font-medium">
							{formatPrice(subtotalUsd, "USD")}
						</span>
					</div>

					<div className="flex gap-3">
						<Button variant="outline" onClick={onBack} className="flex-1">
							Volver
						</Button>
						<Button
							onClick={handleContinue}
							disabled={!hasSelection}
							className="flex-1"
						>
							Continuar
						</Button>
					</div>

					{!hasSelection && (
						<p className="text-center text-sm text-muted-foreground">
							Selecciona al menos una cuenta para continuar
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
