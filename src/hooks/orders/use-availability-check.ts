import { useCallback, useEffect, useRef, useState } from "react";

export interface AvailabilityItem {
	serviceId: number;
	title: string;
	months: number;
}

export interface AvailabilityItemResult extends AvailabilityItem {
	ticketId?: string;
	status: "pending" | "available" | "not_available" | "error";
}

export interface AvailabilityClient {
	name: string;
	phone: string;
}

export type AvailabilityPhase =
	| "idle"
	| "checking"
	| "all_available"
	| "some_unavailable"
	| "timeout"
	| "error";

const POLL_MS = 4000;
const TIMEOUT_MS = 150_000; // 2.5 min

/**
 * Crea una consulta de disponibilidad por cada servicio bajo pedido y poolea
 * hasta que el admin responde (vía el bot) o se agota el tiempo.
 */
export function useAvailabilityCheck() {
	const [phase, setPhase] = useState<AvailabilityPhase>("idle");
	const [results, setResults] = useState<AvailabilityItemResult[]>([]);

	const resultsRef = useRef<AvailabilityItemResult[]>([]);
	const startedAtRef = useRef<number>(0);

	const update = useCallback((next: AvailabilityItemResult[]) => {
		resultsRef.current = next;
		setResults(next);
	}, []);

	const start = useCallback(
		async (items: AvailabilityItem[], client: AvailabilityClient) => {
			setPhase("checking");
			startedAtRef.current = Date.now();

			const created = await Promise.all(
				items.map(async (item): Promise<AvailabilityItemResult> => {
					try {
						const res = await fetch("/api/availability", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								serviceId: item.serviceId,
								clientName: client.name,
								clientPhone: client.phone,
								months: item.months,
							}),
						});
						const json = await res.json();
						if (!res.ok || !json.ticketId) {
							return { ...item, status: "error" };
						}
						return { ...item, ticketId: json.ticketId, status: "pending" };
					} catch {
						return { ...item, status: "error" };
					}
				}),
			);

			update(created);

			// Si alguna falló al crearse, abortamos con error.
			if (created.some((r) => r.status === "error")) {
				setPhase("error");
			}
		},
		[update],
	);

	useEffect(() => {
		if (phase !== "checking") return;

		const poll = async () => {
			const current = resultsRef.current;

			const updated = await Promise.all(
				current.map(async (r): Promise<AvailabilityItemResult> => {
					if (r.status !== "pending" || !r.ticketId) return r;
					try {
						const res = await fetch(`/api/availability/${r.ticketId}`);
						const json = await res.json();
						if (json.resolvedAction === "available") {
							return { ...r, status: "available" };
						}
						if (json.resolvedAction === "not_available") {
							return { ...r, status: "not_available" };
						}
						return r;
					} catch {
						return r;
					}
				}),
			);

			update(updated);

			const anyPending = updated.some((r) => r.status === "pending");
			if (!anyPending) {
				setPhase(
					updated.every((r) => r.status === "available")
						? "all_available"
						: "some_unavailable",
				);
				return;
			}

			if (Date.now() - startedAtRef.current > TIMEOUT_MS) {
				setPhase("timeout");
			}
		};

		const id = setInterval(poll, POLL_MS);
		return () => clearInterval(id);
	}, [phase, update]);

	return { phase, results, start };
}
