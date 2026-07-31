"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/auth/use-auth";

interface RecoverFormData {
	email: string;
}

const recoverSchema = yup.object({
	email: yup
		.string()
		.required("El correo electrónico es obligatorio")
		.email("Ingresa un correo electrónico válido")
		.trim(),
});

export default function RecuperarPage() {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const { requestReset, isLoading, error } = useAuth();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RecoverFormData>({
		resolver: yupResolver(recoverSchema),
		defaultValues: { email: "" },
	});

	const onSubmit = async (values: RecoverFormData) => {
		const result = await requestReset(values.email);
		if (result) {
			setSentTo(values.email.trim().toLowerCase());
		}
	};

	if (sentTo) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24 pb-12">
				<div className="container mx-auto max-w-md px-4">
					<Card className="border-primary/20 bg-primary/5">
						<CardHeader className="text-center pb-2">
							<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary">
								<CheckCircle2 className="size-8" />
							</div>
							<CardTitle className="text-2xl">Revisá tu correo</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6 text-center">
							<p className="text-sm text-muted-foreground">
								Si <strong>{sentTo}</strong> tiene una cuenta con nosotros, te
								enviamos un link para elegir una nueva contraseña.
							</p>
							<Link href="/cuenta/login">
								<Button size="lg">Volver a ingresar</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24 pb-12">
			<div className="container mx-auto max-w-md px-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
						<p className="text-sm text-muted-foreground">
							Te mandamos un link para elegir una nueva
						</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="recover-email">Correo electrónico</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
									<Input
										id="recover-email"
										type="email"
										placeholder="juan@ejemplo.com"
										{...register("email")}
										aria-invalid={!!errors.email}
										className="pl-10"
										autoComplete="email"
									/>
								</div>
								{errors.email && (
									<p className="text-sm text-destructive">
										{errors.email.message}
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
								{isLoading ? "Enviando..." : "Enviar link de recuperación"}
							</Button>
						</form>

						<p className="mt-6 text-center text-sm text-muted-foreground">
							<Link
								href="/cuenta/login"
								className="font-medium text-primary hover:underline"
							>
								Volver a ingresar
							</Link>
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
