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
 * Uploads a receipt image to Supabase Storage
 * @param file - The image file to upload
 * @returns The path and public URL of the uploaded file
 * @throws ReceiptUploadError if validation or upload fails
 */
export async function uploadReceipt(file: File): Promise<ReceiptUploadResult> {
	// Validate file
	const validationError = validateFile(file);
	if (validationError) {
		throw validationError;
	}

	// Generate unique filename
	const fileName = generateFileName(file);

	// Upload to Supabase Storage
	const { data, error } = await supabase.storage
		.from(BUCKET_NAME)
		.upload(fileName, file, {
			cacheControl: "3600",
			upsert: false,
		});

	if (error) {
		throw {
			code: "UPLOAD_FAILED",
			message: `Error al subir el archivo: ${error.message}`,
		} as ReceiptUploadError;
	}

	// Get public URL
	const {
		data: { publicUrl },
	} = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

	return {
		path: data.path,
		publicUrl,
	};
}

/**
 * Deletes a receipt from Supabase Storage
 * Used for cleanup/rollback scenarios
 */
export async function deleteReceipt(path: string): Promise<void> {
	const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

	if (error) {
		console.error("Error deleting receipt:", error);
		throw new Error(`Failed to delete receipt: ${error.message}`);
	}
}
