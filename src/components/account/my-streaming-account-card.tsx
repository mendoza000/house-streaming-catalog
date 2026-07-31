"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MyStreamingAccount } from "@/types/account-types";

const formatExpiry = (iso: string) =>
	new Date(iso).toLocaleDateString("es-VE", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

export function MyStreamingAccountCard({
	account,
}: {
	account: MyStreamingAccount;
}) {
	const handleCopy = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copiado al portapapeles`);
	};

	return (
		<div className="rounded-lg bg-background p-4 shadow-sm border space-y-3">
			<div className="flex items-center justify-between">
				<p className="text-sm font-semibold">
					{account.service}
					{account.screen != null && (
						<span className="font-normal text-muted-foreground">
							{" "}
							· Pantalla {account.screen}
						</span>
					)}
				</p>
			</div>

			{account.expiresAt && (
				<p className="text-xs text-muted-foreground">
					{account.isActive ? "Vence el " : "Venció el "}
					{formatExpiry(account.expiresAt)}
				</p>
			)}

			{account.isActive ? (
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
			) : (
				<div className="flex items-center justify-between gap-3 rounded bg-amber-500/10 p-3">
					<p className="text-xs text-amber-600 dark:text-amber-400">
						Esta cuenta venció. Renovala para volver a ver las credenciales.
					</p>
					<Link href="/mis-cuentas">
						<Button size="sm" variant="outline">
							Renovar
						</Button>
					</Link>
				</div>
			)}
		</div>
	);
}
