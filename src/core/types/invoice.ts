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

// Matches the real GET /api/v1/payments response. As of 2026-09-16 the live response now includes
// customerName (confirmed via a real response body: {id, cycleId, customerName, code, paymentDate,
// amount}). refNo/customerId/date/received/originalAmount/balance/createdBy still do not exist on
// the real API — only customerName was independently verified to have been added; do not assume the
// others appeared too without re-checking a live response.
export interface PaymentResult {
	id?: string;
	cycleId?: string;
	customerName?: string;
	code?: string;
	paymentDate?: string;
	amount?: number;
}

export interface InvoiceExportLineApi {
	refNo?: string;
	cycleId?: string;
	customerName?: string;
	referredByName?: string;
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
	cycleId: string | null;
	customerName: string;
	referredByName: string | null;
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
