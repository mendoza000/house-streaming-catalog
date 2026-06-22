"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DeliveredAccount } from "@/types/delivery";

interface DeliveredAccountsCardProps {
	accounts: DeliveredAccount[];
}

const formatExpiry = (iso: string) =>
	// timeZone UTC: expires_at es medianoche UTC del día de pago; sin esto se
	// renderiza un día antes en husos negativos (VE/CO).
	new Date(iso).toLocaleDateString("es-VE", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});

/**
 * Render compartido de las credenciales entregadas (email/contraseña por
 * pantalla, con copiar al portapapeles). Reusado por el paso de confirmación
 * del checkout y por la página de seguimiento /orden/[token].
 */
export function DeliveredAccountsCard({
	accounts,
}: DeliveredAccountsCardProps) {
	const handleCopy = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copiado al portapapeles`);
	};

	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-sm flex items-center gap-2">
				📦 Datos de tu{accounts.length > 1 ? "s" : ""} cuenta
				{accounts.length > 1 ? "s" : ""}:
			</h3>

			{accounts.map((account, index) => (
				<div
					key={`${account.mail}-${account.screen}-${index}`}
					className="rounded-lg bg-background p-4 shadow-sm border space-y-3"
				>
					{account.service && (
						<p className="text-sm font-semibold">
							{account.service}{" "}
							<span className="font-normal text-muted-foreground">
								· Pantalla {account.screen}
							</span>
						</p>
					)}

					{account.expires_at && (
						<p className="text-xs text-muted-foreground">
							Vence el {formatExpiry(account.expires_at)}
						</p>
					)}

					<div className="space-y-3 text-sm">
						{account.mail && (
							<div className="flex items-center justify-between p-2 rounded bg-muted/50">
								<span className="text-muted-foreground">Email:</span>
								<div className="flex items-center gap-2">
									<span className="font-mono font-medium">{account.mail}</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6"
										onClick={() => handleCopy(account.mail ?? "", "Email")}
									>
										<Copy className="size-3" />
									</Button>
								</div>
							</div>
						)}

						{account.password && (
							<div className="flex items-center justify-between p-2 rounded bg-muted/50">
								<span className="text-muted-foreground">Contraseña:</span>
								<div className="flex items-center gap-2">
									<span className="font-mono font-medium">
										{account.password}
									</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6"
										onClick={() =>
											handleCopy(account.password ?? "", "Contraseña")
										}
									>
										<Copy className="size-3" />
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			))}

			<div className="rounded-md bg-amber-500/10 p-3">
				<p className="text-xs text-amber-600 dark:text-amber-400">
					⚠️ Guardá estos datos en un lugar seguro. Ante cualquier problema con
					tu cuenta, escribinos.
				</p>
			</div>
		</div>
	);
}
