"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MyStreamingAccountCard } from "@/components/account/my-streaming-account-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/use-auth";
import { useMyAccount } from "@/hooks/auth/use-my-account";
import { useAuthStore } from "@/stores/auth-store";
import type { Currency } from "@/stores/currency-store";
import { formatPrice } from "@/utils/currency";

const STATUS_LABELS: Record<string, string> = {
	draft: "Sin finalizar",
	pending: "Pago pendiente",
	validating: "Validando pago",
	completed: "Completada",
	failed: "Pago rechazado",
	cancelled: "Cancelada",
};

export default function CuentaPage() {
	const router = useRouter();
	const { user, isLoggedIn } = useAuthStore();
	const { logout } = useAuth();
	const { orders, accounts, isLoading, error } = useMyAccount(
		user?.email ?? null,
	);

	useEffect(() => {
		if (!isLoggedIn) {
			router.replace("/cuenta/login");
		}
	}, [isLoggedIn, router]);

	if (!isLoggedIn || !user) return null;

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24 pb-12">
			<div className="container mx-auto max-w-3xl px-4 space-y-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Mi cuenta</h1>
						<p className="text-sm text-muted-foreground">{user.email}</p>
					</div>
					<Button variant="outline" onClick={handleLogout}>
						<LogOut className="size-4" />
						Salir
					</Button>
				</div>

				{isLoading && (
					<p className="text-sm text-muted-foreground">Cargando tu cuenta…</p>
				)}

				{error && <p className="text-sm text-destructive">{error}</p>}

				{!isLoading && (
					<>
						<section className="space-y-3">
							<h2 className="text-xl font-semibold">
								Mis cuentas de streaming
							</h2>
							{accounts && accounts.length > 0 ? (
								<div className="space-y-3">
									{accounts.map((account, index) => (
										<MyStreamingAccountCard
											key={`${account.service}-${account.screen}-${index}`}
											account={account}
										/>
									))}
								</div>
							) : (
								<Card>
									<CardContent className="py-6 text-center text-sm text-muted-foreground">
										Todavía no tenés cuentas activas.{" "}
										<Link
											href="/#catalogo"
											className="text-primary hover:underline"
										>
											Ver catálogo
										</Link>
									</CardContent>
								</Card>
							)}
						</section>

						<section className="space-y-3">
							<h2 className="text-xl font-semibold">Mis compras</h2>
							{orders && orders.length > 0 ? (
								<div className="space-y-3">
									{orders.map((order) => (
										<Card key={order.id}>
											<CardHeader className="flex-row items-center justify-between space-y-0">
												<CardTitle className="text-base">
													Orden #{order.id}
												</CardTitle>
												<Badge
													variant={
														order.status === "completed"
															? "default"
															: "secondary"
													}
												>
													{STATUS_LABELS[order.status ?? ""] ?? order.status}
												</Badge>
											</CardHeader>
											<CardContent className="flex items-center justify-between text-sm text-muted-foreground">
												<span>
													{order.created_at &&
														new Date(order.created_at).toLocaleDateString(
															"es-VE",
															{
																day: "numeric",
																month: "long",
																year: "numeric",
															},
														)}
												</span>
												<span className="font-medium text-foreground">
													{formatPrice(
														order.amount ?? 0,
														(order.currency as Currency) ?? "USD",
													)}
												</span>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<Card>
									<CardContent className="py-6 text-center text-sm text-muted-foreground">
										Todavía no tenés compras registradas con este correo.
									</CardContent>
								</Card>
							)}
						</section>
					</>
				)}
			</div>
		</div>
	);
}
