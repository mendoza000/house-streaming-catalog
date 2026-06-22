"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { CheckCircle2, User } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneInputWithCountry from "react-phone-number-input/react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { CountrySelect } from "@/components/checkout/country-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useReceiptUpload } from "@/hooks/receipts/use-receipt-upload";
import { useServices } from "@/hooks/services/use-services";
import { useSupportRequest } from "@/hooks/support/use-support-request";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import type { ReceiptUploadError } from "@/types/receipt";
import "react-phone-number-input/style.css";

interface SupportFormData {
	name: string;
	phone: string;
	serviceId: string;
	account: string;
	description: string;
}

// Servicios cuya credencial es usuario en lugar de correo (igual que el wabot).
const USER_BASED_SERVICES = ["magis", "flujo"];

const supportFormSchema = yup.object({
	name: yup
		.string()
		.required("El nombre es obligatorio")
		.min(3, "El nombre debe tener al menos 3 caracteres")
		.max(100, "El nombre debe tener máximo 100 caracteres")
		.trim(),
	phone: yup
		.string()
		.required("El número de WhatsApp es obligatorio")
		.test("valid-phone", "Ingresa un número de teléfono válido", (value) =>
			value ? isValidPhoneNumber(value) : false,
		),
	serviceId: yup.string().default(""),
	account: yup
		.string()
		.required("Necesitamos el correo o usuario de tu cuenta")
		.min(3, "Ingresa el correo o usuario de tu cuenta")
		.max(150, "El dato es demasiado largo")
		.trim(),
	description: yup
		.string()
		.required("Cuéntanos qué problema tienes")
		.min(10, "Describe el problema con un poco más de detalle")
		.max(1000, "La descripción es demasiado larga")
		.trim(),
});

export function SupportForm() {
	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<SupportFormData>({
		resolver: yupResolver(supportFormSchema),
		mode: "onBlur",
		defaultValues: {
			name: "",
			phone: "",
			serviceId: "",
			account: "",
			description: "",
		},
	});

	const { data: services } = useServices();

	// El servicio seleccionado define si la credencial es usuario o correo.
	const selectedServiceId = watch("serviceId");
	const selectedService = services?.find(
		(s) => String(s.id) === selectedServiceId,
	);
	const isUserBased =
		selectedService?.name != null &&
		USER_BASED_SERVICES.includes(selectedService.name);
	const accountLabel = isUserBased
		? "Usuario de la cuenta"
		: "Correo de la cuenta";
	const uploadMutation = useReceiptUpload();
	const supportMutation = useSupportRequest();

	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedImage(file);
			const reader = new FileReader();
			reader.onloadend = () => setImagePreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setSelectedImage(null);
		setImagePreview(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const onSubmit = async (data: SupportFormData) => {
		try {
			let receiptUrl: string | undefined;
			if (selectedImage) {
				const uploaded = await uploadMutation.mutateAsync(selectedImage);
				receiptUrl = uploaded.publicUrl;
			}

			// La tabla `tickets` no tiene columna de cuenta, así que el identificador
			// va dentro de la descripción para que el admin lo vea en Telegram.
			const accountLine = `${accountLabel}: ${data.account}`;
			const fullDescription = `${accountLine}\n\n${data.description}`;

			await supportMutation.mutateAsync({
				clientName: data.name,
				clientPhone: data.phone,
				description: fullDescription,
				serviceId: data.serviceId ? Number(data.serviceId) : undefined,
				receiptUrl,
			});

			setSubmitted(true);
		} catch (error) {
			const uploadError = error as ReceiptUploadError;
			toast.error(
				uploadError.message ??
					"No pudimos enviar tu solicitud. Intenta de nuevo.",
			);
		}
	};

	const isSubmitting = uploadMutation.isPending || supportMutation.isPending;

	if (submitted) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center gap-4 py-10 text-center">
					<CheckCircle2 className="size-14 text-primary" />
					<h2 className="text-2xl font-bold">¡Recibimos tu solicitud!</h2>
					<p className="max-w-md text-muted-foreground">
						Nuestro equipo la está revisando y te contactará por WhatsApp muy
						pronto. No necesitas hacer nada más.
					</p>
					<Button asChild size="lg" className="mt-2">
						<a
							href={getWhatsAppUrl(
								"Hola, acabo de enviar una solicitud de soporte desde la web.",
							)}
							target="_blank"
							rel="noopener noreferrer"
						>
							Escribir por WhatsApp ahora
						</a>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Solicitar soporte</CardTitle>
				<p className="text-sm text-muted-foreground">
					Completa tus datos y cuéntanos qué problema tienes. Te contactaremos
					por WhatsApp para ayudarte.
				</p>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* Nombre */}
					<div className="space-y-2">
						<Label htmlFor="support-name">
							Nombre completo <span className="text-destructive">*</span>
						</Label>
						<div className="relative">
							<User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
							<Input
								id="support-name"
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

					{/* WhatsApp */}
					<div className="space-y-2">
						<Label htmlFor="support-phone">
							Número de WhatsApp <span className="text-destructive">*</span>
						</Label>
						<PhoneInputWithCountry
							name="phone"
							control={control}
							defaultCountry="VE"
							international
							countryCallingCodeEditable={false}
							addInternationalOption={false}
							countrySelectComponent={CountrySelect}
							id="support-phone"
							inputComponent={Input}
							autoComplete="tel"
							numberInputProps={{ "aria-invalid": !!errors.phone }}
							className="phone-input-field"
						/>
						{errors.phone && (
							<p className="text-sm text-destructive">{errors.phone.message}</p>
						)}
					</div>

					{/* Servicio afectado (opcional) */}
					<div className="space-y-2">
						<Label htmlFor="support-service">Servicio afectado</Label>
						<Controller
							name="serviceId"
							control={control}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger id="support-service" className="w-full">
										<SelectValue placeholder="No estoy seguro / otro" />
									</SelectTrigger>
									<SelectContent>
										{services?.map((service) => (
											<SelectItem key={service.id} value={String(service.id)}>
												{service.comercial_name ??
													service.name ??
													`Servicio ${service.id}`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</div>

					{/* Correo o usuario de la cuenta */}
					<div className="space-y-2">
						<Label htmlFor="support-account">
							{accountLabel} <span className="text-destructive">*</span>
						</Label>
						<Input
							id="support-account"
							type="text"
							inputMode={isUserBased ? "text" : "email"}
							placeholder={isUserBased ? "tu_usuario" : "correo@ejemplo.com"}
							{...register("account")}
							aria-invalid={!!errors.account}
							autoComplete={isUserBased ? "username" : "email"}
						/>
						{errors.account && (
							<p className="text-sm text-destructive">
								{errors.account.message}
							</p>
						)}
					</div>

					{/* Descripción */}
					<div className="space-y-2">
						<Label htmlFor="support-description">
							¿Qué problema tienes? <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="support-description"
							placeholder="Cuéntanos con tus palabras qué está pasando con tu cuenta..."
							{...register("description")}
							aria-invalid={!!errors.description}
						/>
						{errors.description && (
							<p className="text-sm text-destructive">
								{errors.description.message}
							</p>
						)}
					</div>

					{/* Foto / captura (opcional) */}
					<div className="space-y-3">
						<Label>Adjunta una foto o captura (opcional)</Label>
						<button
							type="button"
							className="relative flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-4 transition-colors hover:border-primary/50 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
							onClick={() => fileInputRef.current?.click()}
						>
							{imagePreview ? (
								<div className="relative size-full min-h-40">
									<Image
										src={imagePreview}
										alt="Captura del problema"
										fill
										className="rounded-lg object-contain"
									/>
								</div>
							) : (
								<>
									<div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
										<svg
											className="size-6 text-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>Subir imagen</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										Haz clic para subir una imagen
									</p>
									<p className="text-xs text-muted-foreground/70">
										PNG, JPG o JPEG hasta 5MB
									</p>
								</>
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/png,image/jpeg,image/jpg"
								onChange={handleImageChange}
								className="hidden"
							/>
						</button>
						{selectedImage && (
							<div className="flex items-center justify-between rounded-lg bg-muted p-2">
								<span className="truncate text-sm">{selectedImage.name}</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										handleRemoveImage();
									}}
								>
									Eliminar
								</Button>
							</div>
						)}
					</div>

					<p className="text-xs text-muted-foreground">
						<span className="text-destructive">*</span> Campos obligatorios
					</p>

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Enviando..." : "Enviar solicitud de soporte"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
