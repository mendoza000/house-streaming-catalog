"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { CheckCircle2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/auth/use-auth";

interface RegisterFormData {
	email: string;
	password: string;
	confirmPassword: string;
}

const registerSchema = yup.object({
	email: yup
		.string()
		.required("El correo electrónico es obligatorio")
		.email("Ingresa un correo electrónico válido")
		.trim(),
	password: yup
		.string()
		.required("La contraseña es obligatoria")
		.min(8, "La contraseña debe tener al menos 8 caracteres"),
	confirmPassword: yup
		.string()
		.required("Confirmá tu contraseña")
		.oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
});

export default function RegistroPage() {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const { register: registerUser, isLoading, error } = useAuth();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: yupResolver(registerSchema),
		defaultValues: { email: "", password: "", confirmPassword: "" },
	});

	const onSubmit = async (values: RegisterFormData) => {
		const result = await registerUser(values.email, values.password);
		if (result) {
			setSentTo(values.email.trim().toLowerCase());
		}
	};

	if (sentTo) {
		return (
			<AuthSplitLayout>
				<div className="text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
						<CheckCircle2 className="size-8" />
					</div>
					<h1 className="text-2xl font-semibold tracking-tight">¡Ya casi!</h1>
					<p className="mt-4 text-sm text-muted-foreground">
						Te enviamos un correo a <strong>{sentTo}</strong> para confirmar tu
						cuenta. Abrí el link y ya vas a poder ver tus compras y tus
						credenciales.
					</p>
					<Link href="/">
						<Button size="lg" className="mt-6 w-full">
							Ir al inicio
						</Button>
					</Link>
				</div>
			</AuthSplitLayout>
		);
	}

	return (
		<AuthSplitLayout>
			<h1 className="text-2xl font-semibold tracking-tight">Creá tu cuenta</h1>
			<p className="mt-1.5 text-sm text-muted-foreground">
				Usá el mismo correo con el que compraste para ver tu historial
			</p>

			<form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
				<div className="space-y-2">
					<Label htmlFor="register-email">Correo electrónico</Label>
					<div className="relative">
						<Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="register-email"
							type="email"
							placeholder="juan@ejemplo.com"
							{...register("email")}
							aria-invalid={!!errors.email}
							className="pl-10"
							autoComplete="email"
						/>
					</div>
					{errors.email && (
						<p className="text-sm text-destructive">{errors.email.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="register-password">Contraseña</Label>
					<div className="relative">
						<Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="register-password"
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
					<Label htmlFor="register-confirm-password">
						Confirmar contraseña
					</Label>
					<div className="relative">
						<Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="register-confirm-password"
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

				<Button type="submit" className="w-full" size="lg" disabled={isLoading}>
					{isLoading ? "Creando cuenta..." : "Crear cuenta"}
				</Button>
			</form>

			<p className="mt-6 text-center text-sm text-muted-foreground">
				¿Ya tenés cuenta?{" "}
				<Link
					href="/cuenta/login"
					className="font-medium text-primary hover:underline"
				>
					Ingresá
				</Link>
			</p>
		</AuthSplitLayout>
	);
}
