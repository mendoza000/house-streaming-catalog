"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneInputWithCountry from "react-phone-number-input/react-hook-form";
import * as yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "react-phone-number-input/style.css";
import { CountrySelect } from "@/components/checkout/country-select";
import type { ClientFormData } from "@/types/order-types";

interface ClientInfoFormProps {
	onValidChange: (isValid: boolean, data: ClientFormData) => void;
}

// Yup validation schema
const clientFormSchema = yup.object({
	name: yup
		.string()
		.required("El nombre es obligatorio")
		.min(3, "El nombre debe tener al menos 3 caracteres")
		.max(100, "El nombre debe tener máximo 100 caracteres")
		.trim(),
	email: yup
		.string()
		.required("El correo electrónico es obligatorio")
		.email("Ingresa un correo electrónico válido")
		.trim(),
	phone: yup
		.string()
		.required("El número de teléfono es obligatorio")
		.test("valid-phone", "Ingresa un número de teléfono válido", (value) =>
			value ? isValidPhoneNumber(value) : false,
		),
});

export function ClientInfoForm({ onValidChange }: ClientInfoFormProps) {
	const {
		register,
		control,
		formState: { errors, isValid },
		watch,
	} = useForm<ClientFormData>({
		resolver: yupResolver(clientFormSchema),
		mode: "onBlur",
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
	});

	// Watch all form values
	const formData = watch();

	// Notify parent when form validity or data changes
	useEffect(() => {
		onValidChange(isValid, formData);
	}, [isValid, formData, onValidChange]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Información del cliente</CardTitle>
				<p className="text-sm text-muted-foreground">
					Completa tus datos para procesar tu pedido
				</p>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Nombre completo */}
				<div className="space-y-2">
					<Label htmlFor="client-name">
						Nombre completo <span className="text-destructive">*</span>
					</Label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<Input
							id="client-name"
							type="text"
							placeholder="Juan Pérez"
							{...register("name")}
							aria-invalid={!!errors.name}
							className="pl-10"
							autoComplete="name"
						/>
					</div>
					{errors.name && (
						<p className="text-sm text-destructive">{errors.name.message}</p>
					)}
				</div>

				{/* Email */}
				<div className="space-y-2">
					<Label htmlFor="client-email">
						Correo electrónico <span className="text-destructive">*</span>
					</Label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<Input
							id="client-email"
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

				{/* Teléfono */}
				<div className="space-y-2">
					<Label htmlFor="client-phone">
						Número de teléfono <span className="text-destructive">*</span>
					</Label>
					<PhoneInputWithCountry
						name="phone"
						control={control}
						defaultCountry="VE"
						international
						countryCallingCodeEditable={false}
						addInternationalOption={false}
						countrySelectComponent={CountrySelect}
						id="client-phone"
						inputComponent={Input}
						autoComplete="tel"
						numberInputProps={{ "aria-invalid": !!errors.phone }}
						className="phone-input-field"
					/>
					{errors.phone && (
						<p className="text-sm text-destructive">{errors.phone.message}</p>
					)}
				</div>

				<p className="text-xs text-muted-foreground">
					<span className="text-destructive">*</span> Campos obligatorios
				</p>
			</CardContent>
		</Card>
	);
}
