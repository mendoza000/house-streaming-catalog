"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentMethod } from "@/constants/payment-methods";
import { useExchangeRate } from "@/hooks/exchange-rate/use-exchange-rate";
import { useReceiptUpload } from "@/hooks/receipts/use-receipt-upload";
import { useCartStore } from "@/stores/cart-store";
import type { ReceiptUploadError } from "@/types/receipt";
import { formatPrice } from "@/utils/currency";
import { getMethodSettlement } from "@/utils/settlement";

interface ManualPaymentStepProps {
	method: PaymentMethod;
	onSubmit: (receiptUrl: string) => void;
	onBack: () => void;
}

/** Filas de datos de cuenta a renderizar dinámicamente según el método. */
const ACCOUNT_FIELDS: Array<{
	key: keyof NonNullable<PaymentMethod["accountInfo"]>;
	label: string;
	mono?: boolean;
}> = [
	{ key: "bank", label: "Banco" },
	{ key: "accountType", label: "Tipo de cuenta" },
	{ key: "accountNumber", label: "N° de cuenta", mono: true },
	{ key: "phone", label: "Teléfono", mono: true },
	{ key: "email", label: "Correo", mono: true },
	{ key: "holder", label: "Titular" },
	{ key: "id", label: "Documento", mono: true },
];

export function ManualPaymentStep({
	method,
	onSubmit,
	onBack,
}: ManualPaymentStepProps) {
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const items = useCartStore((state) => state.items);
	const { data: exchangeRate } = useExchangeRate();
	const settlement = getMethodSettlement(method, items, exchangeRate);

	// Upload mutation
	const uploadMutation = useReceiptUpload();

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async () => {
		if (!selectedImage) return;

		try {
			const result = await uploadMutation.mutateAsync(selectedImage);
			toast.success("Comprobante subido exitosamente");
			onSubmit(result.publicUrl);
		} catch (error) {
			const uploadError = error as ReceiptUploadError;
			toast.error(uploadError.message || "Error al subir el comprobante");
		}
	};

	const handleRemoveImage = () => {
		setSelectedImage(null);
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const accountInfo = method.accountInfo ?? {};
	const visibleFields = ACCOUNT_FIELDS.filter(({ key }) => accountInfo[key]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">{method.name}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Account Info */}
				<div className="rounded-lg bg-muted p-4 space-y-3">
					<p className="font-semibold text-sm mb-3">
						Realiza la transferencia a los siguientes datos:
					</p>
					{visibleFields.map(({ key, label, mono }) => (
						<div key={key} className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">{label}:</span>
							<span className={mono ? "font-mono font-medium" : "font-medium"}>
								{accountInfo[key]}
							</span>
						</div>
					))}
				</div>

				{/* Total Amount */}
				<div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2">
					{settlement.surcharge > 0 && (
						<>
							<div className="flex items-center justify-between text-sm text-muted-foreground">
								<span>Subtotal:</span>
								<span>
									{formatPrice(settlement.baseTotal, settlement.currency)}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm text-muted-foreground">
								<span>Recargo por servicio:</span>
								<span>
									+{formatPrice(settlement.surcharge, settlement.currency)}
								</span>
							</div>
						</>
					)}
					<div className="flex items-center justify-between">
						<span className="text-sm font-semibold text-primary">
							Total a pagar:
						</span>
						<span className="text-2xl font-bold text-primary">
							{formatPrice(settlement.total, settlement.currency)}
						</span>
					</div>
				</div>

				{/* Image Upload */}
				<div className="space-y-3">
					<p className="font-semibold text-sm">Sube el comprobante de pago:</p>
					<button
						type="button"
						className="relative flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-4 transition-colors hover:border-primary/50 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
						onClick={() => fileInputRef.current?.click()}
					>
						{imagePreview ? (
							<div className="relative size-full min-h-40">
								<Image
									src={imagePreview}
									alt="Comprobante de pago"
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

				{/* Actions */}
				<div className="flex gap-3">
					<Button variant="outline" onClick={onBack} className="flex-1">
						Volver
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedImage || uploadMutation.isPending}
						className="flex-1"
					>
						{uploadMutation.isPending
							? "Enviando..."
							: "Ya realicé el pago, enviar comprobante"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
