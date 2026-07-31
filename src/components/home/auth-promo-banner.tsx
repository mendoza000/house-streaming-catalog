"use client";

import { KeyRound, ShoppingBag, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Invita a crear una cuenta opcional: comprar como invitado sigue funcionando
 * igual, pero con cuenta se desbloquea historial de compras + credenciales.
 * Si ya hay sesión, cambia el CTA a "Ver mis compras" en vez de ocultarse.
 */
export default function AuthPromoBanner() {
	const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

	return (
		<section className="mt-8 px-4">
			<Card className="border-primary/20 bg-primary/5 py-0">
				<CardContent className="flex flex-col items-center gap-4 py-6 text-center md:flex-row md:justify-between md:text-left">
					<div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
						<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
							{isLoggedIn ? (
								<ShoppingBag className="size-6" />
							) : (
								<KeyRound className="size-6" />
							)}
						</div>
						<div>
							<h2 className="font-semibold">
								{isLoggedIn
									? "Ya tenés tu cuenta activa"
									: "Creá tu cuenta gratis"}
							</h2>
							<p className="text-sm text-muted-foreground">
								{isLoggedIn
									? "Mirá tu historial de compras y las credenciales de tus cuentas"
									: "No es necesaria para comprar, pero te deja ver tus compras y las credenciales de tus cuentas en un solo lugar"}
							</p>
						</div>
					</div>

					<Link href={isLoggedIn ? "/cuenta" : "/cuenta/registro"}>
						<Button size="lg">
							{isLoggedIn ? (
								<>
									<ShoppingBag className="size-4" />
									Ver mis compras
								</>
							) : (
								<>
									<UserPlus className="size-4" />
									Crear cuenta
								</>
							)}
						</Button>
					</Link>
				</CardContent>
			</Card>
		</section>
	);
}
