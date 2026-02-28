export type InvoiceType = "invoice" | "receipt";

export interface Invoice {
	id: string;
	refNo: string;
	customerName: string;
	date: string;
	type: string;

	// Report Fields
	couponId?: string;
	cycle?: string;
	amount?: number;
	createdBy?: string;
	paymentTerm?: string;
}

export interface InvoiceExportLineResult {
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
	previewRows: InvoiceExportPreviewRow[];
	autoPrint?: boolean;
}
