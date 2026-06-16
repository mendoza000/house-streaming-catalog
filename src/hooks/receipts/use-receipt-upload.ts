import { useMutation } from "@tanstack/react-query"
import { uploadReceipt } from "@/api/receipts"
import type { ReceiptUploadResult } from "@/types/supabase"

export const receiptKeys = {
	all: ["receipts"] as const,
	upload: ["receipts", "upload"] as const,
}

/**
 * Hook for uploading receipt images to Supabase Storage
 * Uses TanStack Query mutation for state management
 */
export function useReceiptUpload() {
	return useMutation<ReceiptUploadResult, Error, File>({
		mutationFn: uploadReceipt,
		mutationKey: receiptKeys.upload,
	})
}
