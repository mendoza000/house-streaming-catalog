import { useMutation } from "@tanstack/react-query";
import { uploadReceipt } from "@/api/receipts";
import type { ReceiptUploadResult } from "@/types/receipt";

export const receiptKeys = {
	all: ["receipts"] as const,
	upload: ["receipts", "upload"] as const,
};

/**
 * Hook for uploading receipt images to Supabase Storage
 * Uses TanStack Query mutation for state management
 */
export function useReceiptUpload() {
	return useMutation<ReceiptUploadResult, Error, File>({
		mutationFn: async (file) => {
			// uploadReceipt follows the api/ result-tuple contract; re-throw here so
			// TanStack Query surfaces the error to consumers as before.
			const { data, error } = await uploadReceipt(file);
			if (error) throw error;
			return data as ReceiptUploadResult;
		},
		mutationKey: receiptKeys.upload,
	});
}
