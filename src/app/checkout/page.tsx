"use client";

import { useState } from "react";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { PaymentMethodsSection } from "@/components/checkout/payment-methods-section";
import { ClientInfoForm } from "@/components/checkout/client-info-form";
import {
  ShieldCheckIcon,
  LockClosedIcon,
  StarIcon,
} from "@/components/checkout/trust-icons";
import { ShoppingBag } from "lucide-react";
import type { ClientFormData } from "@/types/order-types";

const STEPS = [
  { number: 1, label: "Revisión" },
  { number: 2, label: "Pago" },
  { number: 3, label: "Confirmación" },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [clientData, setClientData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [isClientFormValid, setIsClientFormValid] = useState(false);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleClientFormChange = (isValid: boolean, data: ClientFormData) => {
    setIsClientFormValid(isValid);
    setClientData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-20">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
              <ShoppingBag className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
              <p className="text-sm text-muted-foreground">
                Completa tu compra de forma segura
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b bg-background/50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((step, index) => (
              <>
                <div key={step.number} className="flex items-center gap-2">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
                      currentStep >= step.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-sm ${
                      currentStep >= step.number
                        ? "font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    key={`separator-${step.number}`}
                    className={`h-px w-12 ${
                      currentStep > step.number ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1fr,1.2fr] lg:gap-8">
          {/* Left Column - Order Summary & Client Info */}
          <div className="order-2 md:order-1 space-y-6">
            <ClientInfoForm onValidChange={handleClientFormChange} />
            <CheckoutSummary />
          </div>

          {/* Right Column - Payment Methods */}
          <div className="order-1 md:order-2 space-y-6">
            <PaymentMethodsSection
              onStepChange={handleStepChange}
              clientData={clientData}
              isClientFormValid={isClientFormValid}
            />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="size-4" />
            <span>Pago 100% seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <LockClosedIcon className="size-4" />
            <span>Datos encriptados</span>
          </div>
          <div className="flex items-center gap-2">
            <StarIcon className="size-4" />
            <span>Soporte 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
