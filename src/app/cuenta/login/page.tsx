"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/auth/use-auth";

interface LoginFormData {
	email: string;
	password: string;
}

const loginSchema = yup.object({
	email: yup
		.string()
		.required("El correo electrónico es obligatorio")
		.email("Ingresa un correo electrónico válido")
		.trim(),
	password: yup.string().required("La contraseña es obligatoria"),
});

export default function LoginPage() {
	const router = useRouter();
	const { login, isLoading, error } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: yupResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = async (values: LoginFormData) => {
		const result = await login(values.email, values.password);
		if (result) {
			toast.success("¡Bienvenido de nuevo!");
			router.push("/cuenta");
		}
	};

	return (
		<AuthSplitLayout>
			<h1 className="text-2xl font-semibold tracking-tight">
				Ingresá a tu cuenta
			</h1>
			<p className="mt-1.5 text-sm text-muted-foreground">
				Mirá tus compras y las credenciales de tus cuentas
			</p>

			<form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
				<div className="space-y-2">
					<Label htmlFor="login-email">Correo electrónico</Label>
					<div className="relative">
						<Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="login-email"
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
					<div className="flex items-center justify-between">
						<Label htmlFor="login-password">Contraseña</Label>
						<Link
							href="/cuenta/recuperar"
							className="text-xs text-muted-foreground hover:underline"
						>
							¿Olvidaste tu contraseña?
						</Link>
					</div>
					<div className="relative">
						<Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="login-password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							{...register("password")}
							aria-invalid={!!errors.password}
							className="px-10"
							autoComplete="current-password"
						/>
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							aria-label={
								showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
							}
						>
							{showPassword ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					</div>
					{errors.password && (
						<p className="text-sm text-destructive">
							{errors.password.message}
						</p>
					)}
				</div>

				{error && <p className="text-sm text-destructive">{error}</p>}

				<Button type="submit" className="w-full" size="lg" disabled={isLoading}>
					{isLoading ? "Ingresando..." : "Ingresar"}
				</Button>
			</form>

			<p className="mt-6 text-center text-sm text-muted-foreground">
				¿Todavía no tenés cuenta?{" "}
				<Link
					href="/cuenta/registro"
					className="font-medium text-primary hover:underline"
				>
					Creá una gratis
				</Link>
			</p>
		</AuthSplitLayout>
	);
}
