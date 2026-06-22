"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MethodStep } from "@/components/renewals/method-step";
import { PhoneStep } from "@/components/renewals/phone-step";
import { RenewalPaymentStep } from "@/components/renewals/renewal-payment-step";
import { SelectStep } from "@/components/renewals/select-step";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountLookup } from "@/hooks/renewals/use-account-lookup";
import type {
	RenewableAccount,
	RenewalCreatedPayload,
	RenewalSelection,
} from "@/types/renewal-types";

type Step = "phone" | "select" | "method" | "pay" | "done";

const STEPS = [
	{ key: "phone", number: 1, label: "Identifícate" },
	{ key: "select", number: 2, label: "Elige" },
	{ key: "pay", number: 3, label: "Paga" },
];

function stepNumber(step: Step): number {
	if (step === "phone") return 1;
	if (step === "select") return 2;
	return 3;
}

export default function MisCuentasPage() {
	const [step, setStep] = useState<Step>("phone");
	const [phone, setPhone] = useState("");
	const [accounts, setAccounts] = useState<RenewableAccount[]>([]);
	const [selections, setSelections] = useState<RenewalSelection[]>([]);
	const [created, setCreated] = useState<RenewalCreatedPayload | null>(null);
	const [triedLookup, setTriedLookup] = useState(false);

	const { lookup, isLoading, error } = useAccountLookup();

	const handlePhoneSubmit = async (value: string) => {
		setTriedLookup(true);
		const found = await lookup(value);
		if (found && found.length > 0) {
			setPhone(value);
			setAccounts(found);
			setStep("select");
		}
	};

	const handleSelectContinue = (sels: RenewalSelection[]) => {
		setSelections(sels);
		setStep("method");
	};

	const handleCreated = (payload: RenewalCreatedPayload) => {
		setCreated(payload);
		setStep("pay");
	};

	const current = stepNumber(step);

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20">
			{/* Header */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto max-w-3xl px-4 py-6">
					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
							<RefreshCw className="size-6 text-primary" />
						</div>
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Renovar</h1>
							<p className="text-sm text-muted-foreground">
								Extiende el vencimiento de tus cuentas en minutos
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Stepper */}
			<div className="border-b bg-background/50">
				<div className="container mx-auto max-w-3xl px-4 py-4">
					<div className="flex items-center justify-center gap-2">
						{STEPS.map((s, index) => (
							<div key={s.key} className="flex items-center gap-2">
								<div className="flex items-center gap-2">
									<div
										className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
											current >= s.number
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground"
										}`}
									>
										{s.number}
									</div>
									<span
										className={`text-sm ${
											current >= s.number
												? "font-medium"
												: "text-muted-foreground"
										}`}
									>
										{s.label}
									</span>
								</div>
								{index < STEPS.length - 1 && (
									<div
										className={`h-px w-10 ${
											current > s.number ? "bg-primary" : "bg-border"
										}`}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
				{step === "phone" && (
					<PhoneStep
						onSubmit={handlePhoneSubmit}
						isLoading={isLoading}
						error={error}
						notFound={triedLookup && !isLoading && !error}
					/>
				)}

				{step === "select" && (
					<SelectStep
						accounts={accounts}
						onContinue={handleSelectContinue}
						onBack={() => setStep("phone")}
					/>
				)}

				{step === "method" && (
					<MethodStep
						phone={phone}
						accounts={accounts}
						selections={selections}
						onCreated={handleCreated}
						onBack={() => setStep("select")}
					/>
				)}

				{step === "pay" && created && (
					<RenewalPaymentStep
						method={created.method}
						orderId={created.orderId}
						phone={phone}
						settlement={created.settlement}
						onComplete={() => setStep("done")}
						onBack={() => setStep("method")}
					/>
				)}

				{step === "done" && created && (
					<Card className="border-primary/20 bg-primary/5">
						<CardHeader className="pb-2 text-center">
							<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary">
								<CheckCircle2 className="size-8" />
							</div>
							<CardTitle className="text-2xl">¡Renovación en marcha!</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6 text-center">
							<p className="text-sm text-muted-foreground">
								Registramos tu pago. En cuanto se confirme, el vencimiento de
								tus cuentas se extiende automáticamente. Puedes seguir el estado
								y ver tus nuevas fechas en el enlace de tu orden.
							</p>
							<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
								<Link href={`/orden/${created.trackingToken}`}>
									<Button size="lg">Ver el estado de mi renovación</Button>
								</Link>
								<Link href="/">
									<Button variant="outline" size="lg">
										Ir al inicio
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
