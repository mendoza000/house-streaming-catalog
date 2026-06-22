import { supabase } from "@/lib/supabase/client";
import type { ReceiptUploadError, ReceiptUploadResult } from "@/types/receipt";

const BUCKET_NAME = "receipts";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

/**
 * Validates file type and size
 */
function validateFile(file: File): ReceiptUploadError | null {
	if (!ALLOWED_TYPES.includes(file.type)) {
		return {
			code: "INVALID_TYPE",
			message:
				"Tipo de archivo no válido. Solo se permiten imágenes PNG y JPEG.",
		};
	}

	if (file.size > MAX_FILE_SIZE) {
		return {
			code: "FILE_TOO_LARGE",
			message: "El archivo es demasiado grande. El tamaño máximo es 5MB.",
		};
	}

	return null;
}

/**
 * Generates a unique filename with timestamp and UUID
 */
function generateFileName(file: File): string {
	const timestamp = Date.now();
	const randomId = crypto.randomUUID();
	const extension = file.name.split(".").pop();
	return `${timestamp}-${randomId}.${extension}`;
}

/**
 * Uploads a receipt image to Supabase Storage.
 * Follows the api/ result-tuple contract: never throws, returns { data, error }.
 * @param file - The image file to upload
 * @returns The path and public URL of the uploaded file, or a typed error
 */
export async function uploadReceipt(file: File): Promise<{
	data: ReceiptUploadResult | null;
	error: ReceiptUploadError | null;
}> {
	try {
		const validationError = validateFile(file);
		if (validationError) {
			return { data: null, error: validationError };
		}

		const fileName = generateFileName(file);

		const { data, error } = await supabase.storage
			.from(BUCKET_NAME)
			.upload(fileName, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (error) {
			return {
				data: null,
				error: {
					code: "UPLOAD_FAILED",
					message: `Error al subir el archivo: ${error.message}`,
				},
			};
		}

		const {
			data: { publicUrl },
		} = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

		return { data: { path: data.path, publicUrl }, error: null };
	} catch (error) {
		return {
			data: null,
			error: {
				code: "UPLOAD_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error inesperado al subir el archivo.",
			},
		};
	}
}

/**
 * Deletes a receipt from Supabase Storage.
 * Used for cleanup/rollback scenarios. Follows the api/ result-tuple contract.
 */
export async function deleteReceipt(
	path: string,
): Promise<{ data: null; error: Error | null }> {
	try {
		const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

		if (error) {
			console.error("Error deleting receipt:", error);
			return {
				data: null,
				error: new Error(`Failed to delete receipt: ${error.message}`),
			};
		}

		return { data: null, error: null };
	} catch (error) {
		console.error("Unexpected error deleting receipt:", error);
		return {
			data: null,
			error:
				error instanceof Error ? error : new Error("Failed to delete receipt"),
		};
	}
}
