import { useCallback, useEffect, useRef, useState } from "react"
import type { DeliveredAccount } from "@/types/delivery"

export interface PaymentValidationInput {
	orderId: number
	clientName: string
	clientPhone: string
	receiptUrl: string
	description: string
}

export type PaymentValidationPhase =
	| "idle"
	| "validating"
	| "approved"
	| "rejected"
	| "timeout"
	| "error"

const POLL_MS = 4000
const TIMEOUT_MS = 10 * 60 * 1000 // 10 min

/**
 * Crea un ticket de validación de pago manual y poolea hasta que el admin
 * aprueba/rechaza por Telegram. Al aprobar, trae las credenciales entregadas
 * (fulfillOrder es idempotente: el trigger ya entregó, esto solo las lee).
 */
export function usePaymentValidation() {
	const [phase, setPhase] = useState<PaymentValidationPhase>("idle")
	const [delivered, setDelivered] = useState<DeliveredAccount[]>([])

	const ticketIdRef = useRef<string | null>(null)
	const orderIdRef = useRef<number | null>(null)
	const startedAtRef = useRef<number>(0)

	const start = useCallback(async (input: PaymentValidationInput) => {
		setPhase("validating")
		startedAtRef.current = Date.now()
		orderIdRef.current = input.orderId

		try {
			const res = await fetch("/api/payment-validation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			})
			const json = await res.json()
			if (!res.ok || !json.ticketId) {
				setPhase("error")
				return
			}
			ticketIdRef.current = json.ticketId
		} catch {
			setPhase("error")
		}
	}, [])

	useEffect(() => {
		if (phase !== "validating") return

		const poll = async () => {
			const ticketId = ticketIdRef.current
			if (!ticketId) return

			try {
				const res = await fetch(`/api/availability/${ticketId}`)
				const json = await res.json()
				const action = json.resolvedAction
				const status = json.status

				if (action === "approve" || status === "approved") {
					const orderId = orderIdRef.current
					if (orderId != null) {
						try {
							const fr = await fetch("/api/orders/fulfill", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ orderId }),
							})
							const fj = await fr.json()
							setDelivered(fj.delivered ?? [])
						} catch {
							// La entrega server-side ya ocurrió por el trigger; si no
							// pudimos leerla, la confirmación muestra "preparando".
						}
					}
					setPhase("approved")
					return
				}

				if (action === "reject" || status === "rejected") {
					setPhase("rejected")
					return
				}
			} catch {
				// reintentar en el próximo tick
			}

			if (Date.now() - startedAtRef.current > TIMEOUT_MS) {
				setPhase("timeout")
			}
		}

		const id = setInterval(poll, POLL_MS)
		return () => clearInterval(id)
	}, [phase])

	return { phase, delivered, start }
}
