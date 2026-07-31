"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/auth/use-auth";

interface NewPasswordFormData {
	password: string;
	confirmPassword: string;
}

const newPasswordSchema = yup.object({
	password: yup
		.string()
		.required("La contraseña es obligatoria")
		.min(8, "La contraseña debe tener al menos 8 caracteres"),
	confirmPassword: yup
		.string()
		.required("Confirmá tu contraseña")
		.oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
});

/**
 * Destino del link de recuperación (`resetPasswordForEmail`'s `redirectTo`).
 * supabase-js parsea el token de recuperación de la URL al cargar (detectSessionInUrl,
 * default true) y deja una sesión de recuperación activa antes de que este form se
 * monte — no hace falta un callback route aparte.
 */
export default function NuevaPasswordPage() {
	const router = useRouter();
	const { changePassword, isLoading, error } = useAuth();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<NewPasswordFormData>({
		resolver: yupResolver(newPasswordSchema),
		defaultValues: { password: "", confirmPassword: "" },
	});

	const onSubmit = async (values: NewPasswordFormData) => {
		const result = await changePassword(values.password);
		if (result) {
			toast.success("Contraseña actualizada");
			router.push("/cuenta");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24 pb-12">
			<div className="container mx-auto max-w-md px-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">
							Elegí tu nueva contraseña
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="new-password">Nueva contraseña</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
									<Input
										id="new-password"
										type="password"
										placeholder="••••••••"
										{...register("password")}
										aria-invalid={!!errors.password}
										className="pl-10"
										autoComplete="new-password"
									/>
								</div>
								{errors.password && (
									<p className="text-sm text-destructive">
										{errors.password.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="new-confirm-password">
									Confirmar contraseña
								</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
									<Input
										id="new-confirm-password"
										type="password"
										placeholder="••••••••"
										{...register("confirmPassword")}
										aria-invalid={!!errors.confirmPassword}
										className="pl-10"
										autoComplete="new-password"
									/>
								</div>
								{errors.confirmPassword && (
									<p className="text-sm text-destructive">
										{errors.confirmPassword.message}
									</p>
								)}
							</div>

							{error && <p className="text-sm text-destructive">{error}</p>}

							<Button
								type="submit"
								className="w-full"
								size="lg"
								disabled={isLoading}
							>
								{isLoading ? "Guardando..." : "Guardar contraseña"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
