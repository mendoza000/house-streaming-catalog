"use client";

import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { CountrySelect } from "@/components/checkout/country-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneStepProps {
	onSubmit: (phone: string) => void;
	isLoading: boolean;
	error: string | null;
	/** true cuando una búsqueda previa no encontró cuentas. */
	notFound: boolean;
}

/**
 * Paso 1: el cliente ingresa el teléfono con el que compró. Es el único dato que
 * identifica sus cuentas (cubre compras web y por WhatsApp).
 */
export function PhoneStep({
	onSubmit,
	isLoading,
	error,
	notFound,
}: PhoneStepProps) {
	const [phone, setPhone] = useState<string | undefined>();

	const isValid = !!phone && isValidPhoneNumber(phone);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isValid && phone) onSubmit(phone);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Encuentra tus cuentas</CardTitle>
				<p className="text-sm text-muted-foreground">
					Ingresa el mismo número de teléfono con el que compraste. Verás tus
					cuentas y cuándo vencen.
				</p>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="renew-phone">Número de teléfono</Label>
						<PhoneInput
							value={phone}
							onChange={setPhone}
							defaultCountry="VE"
							international
							countryCallingCodeEditable={false}
							addInternationalOption={false}
							countrySelectComponent={CountrySelect}
							id="renew-phone"
							inputComponent={Input}
							autoComplete="tel"
							className="phone-input-field"
						/>
					</div>

					{notFound && !error && (
						<div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
							<p className="text-sm text-amber-600 dark:text-amber-400">
								No encontramos cuentas con ese número. Revisa que sea el mismo
								con el que compraste, o escríbenos por WhatsApp y te ayudamos.
							</p>
						</div>
					)}

					{error && (
						<div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={!isValid || isLoading}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Buscando…
							</>
						) : (
							<>
								<Search className="mr-2 size-4" />
								Ver mis cuentas
							</>
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
