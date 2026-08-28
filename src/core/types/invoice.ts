export interface Invoice {
	id: string;
	refNo: string;
	customerName: string;
	date: string;
	type?: string;
	// Temporarily disabled because the invoice list endpoint does not return balance yet.
	// Re-enable together with the invoice table balance enrichment flow.
	// balance?: number | null;

	// Report Fields
	couponId?: string;
	cycle?: string;
	amount?: number;
	createdBy?: string;
	paymentTerm?: string;
}

export interface PaymentResult {
	id?: string;
	cycleId?: string;
	code?: string;
	paymentDate?: string;
	amount?: number;
}

export interface InvoiceExportLineApi {
	refNo?: string;
	customerName?: string;
	date?: string;
	productName?: string | null;
	unit?: string | null;
	pricePerProduct?: number | null;
	quantityPerProduct?: number | null;
	quantity?: number | null;
	amount?: number | null;
	total?: number | null;
	memo?: string | null;
	paid?: number | null;
	balance?: number | null;
}

export interface InvoiceExportPreviewRow {
	refNo: string;
	customerName: string;
	date: string;
	productName: string | null;
	unit: string | null;
	pricePerProduct: number | null;
	quantityPerProduct: number | null;
	quantity: number | null;
	amount: number | null;
	total: number | null;
	memo: string | null;
	paid: number | null;
	balance: number | null;
}

export interface InvoiceExportPreviewLocationState {
	selectedInvoiceIds: string[];
	previewRows?: InvoiceExportPreviewRow[];
	customerId?: string;
	customerName?: string;
	cycleId?: string;
	returnPath?: string;
	receiptPaymentAmount?: number;
	receiptPaymentCode?: string;
	receiptPaymentDate?: string;
	autoPrint?: boolean;
	initialPaperSizeMode?: "a4" | "a5" | "letter";
	initialOrientationMode?: "portrait" | "landscape";
}
