import { useMutation } from "@tanstack/react-query";

export interface SupportRequestInput {
	clientName: string;
	clientPhone: string;
	description: string;
	serviceId?: number;
	receiptUrl?: string;
}

export const supportKeys = {
	all: ["support"] as const,
	create: ["support", "create"] as const,
};

async function postSupportRequest(
	input: SupportRequestInput,
): Promise<{ ticketId: string }> {
	const res = await fetch("/api/support", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	const json = await res.json();
	if (!res.ok || !json.ticketId) {
		throw new Error(json.error ?? "No se pudo enviar la solicitud de soporte");
	}
	return { ticketId: json.ticketId };
}

/**
 * Envía una solicitud de soporte al endpoint /api/support.
 */
export function useSupportRequest() {
	return useMutation<{ ticketId: string }, Error, SupportRequestInput>({
		mutationFn: postSupportRequest,
		mutationKey: supportKeys.create,
	});
}
