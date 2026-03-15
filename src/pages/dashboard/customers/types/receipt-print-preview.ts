export type ReceiptPrintPreviewRow = {
	no: number;
	date: string;
	refNo: string;
	original: number;
	open: number;
	received: number;
	withdrawal: number;
};

export type ReceiptPrintPreviewState = {
	refPrefix: string;
	refNo: string;
	date: string;
	customerLabel: string;
	telephone?: string;
	address?: string;
	memo?: string;
	rows: ReceiptPrintPreviewRow[];
	totalOpen: number;
	totalReceive: number;
	totalWithdrawal: number;
	totalRemaining: number;
};
