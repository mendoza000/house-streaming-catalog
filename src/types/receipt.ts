/** Resultado de subir un comprobante de pago a Supabase Storage. */
export interface ReceiptUploadResult {
	path: string;
	publicUrl: string;
}

/** Error de validación o subida de un comprobante. */
export interface ReceiptUploadError {
	code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "UPLOAD_FAILED";
	message: string;
}
