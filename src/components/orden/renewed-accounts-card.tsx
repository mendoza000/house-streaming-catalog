import { CalendarCheck } from "lucide-react";
import type { RenewalResultItem } from "@/types/renewal-types";
import { formatExpiry } from "@/utils/expiry";

interface RenewedAccountsCardProps {
	items: RenewalResultItem[];
}

/**
 * Resumen de una renovación confirmada: por cada pantalla, su nuevo vencimiento.
 * No muestra credenciales (el cliente ya las tiene de la compra original).
 */
export function RenewedAccountsCard({ items }: RenewedAccountsCardProps) {
	return (
		<div className="space-y-4">
			<h3 className="flex items-center gap-2 text-sm font-semibold">
				<CalendarCheck className="size-4 text-primary" />
				Renovación confirmada
			</h3>

			{items.map((item, index) => (
				<div
					key={`${item.service}-${item.screen}-${index}`}
					className="space-y-1 rounded-lg border bg-background p-4 shadow-sm"
				>
					<p className="text-sm font-semibold">
						{item.service ?? "Cuenta"}{" "}
						{item.screen != null && (
							<span className="font-normal text-muted-foreground">
								· Pantalla {item.screen}
							</span>
						)}
					</p>
					{item.expires_at && (
						<p className="text-sm text-primary">
							Ahora vence el {formatExpiry(item.expires_at)}
						</p>
					)}
				</div>
			))}

			<div className="rounded-md bg-primary/10 p-3">
				<p className="text-xs text-muted-foreground">
					Tu cuenta sigue activa con las mismas credenciales. Solo se extendió
					la fecha de vencimiento.
				</p>
			</div>
		</div>
	);
}
