export interface DailyReportProductRevenue {
	productName?: string | null;
	unit?: string | null;
	totalQuantity?: number | null;
	totalAmount?: number | null;
}

export interface InventoryStockReportLine {
	itemName?: string | null;
	itemCode?: string | null;
	quantity?: number | null;
	type?: "IN" | "OUT" | null;
	reason?: "PURCHASE" | "CONSUME" | "BORROW" | "RETURN" | "SOLD" | null;
	createdAt?: string | null;
}

export interface DailyReportBoughtItem {
	itemName?: string | null;
	expense?: number | null;
}

export interface DailyReportResponse {
	soldProducts?: DailyReportProductRevenue[] | null;
	boughtItems?: DailyReportBoughtItem[] | null;
	totalRevenue?: number | null;
	totalCashReceive?: number | null;
	totalExpense?: number | null;
}

export interface MonthlyExpenseLine {
	description?: string | null;
	amount?: number | null;
}

export interface MonthlyReportResponse {
	accountsReceivable?: number | null;
	saleInvoice?: number | null;
	cashInstallment?: number | null;
	expenses?: MonthlyExpenseLine[] | null;
}

export interface MonthlyReportLine {
	date?: string | null;
	refNo?: string | null;
	reason?: string | null;
	customerName?: string | null;
	memo?: string | null;
	debit?: number | null;
	credit?: number | null;
	balance?: number | null;
}

export interface MonthlyReportDetailsResponse {
	lines?: MonthlyReportLine[] | null;
}

export interface CashTransactionReportLine {
	no?: number | null;
	date?: string | null;
	refNo?: string | null;
	type?: "DEBIT" | "CREDIT" | null;
	name?: string | null;
	memo?: string | null;
	debit?: number | null;
	credit?: number | null;
	balance?: number | null;
}

export interface CashTransactionReportResponse {
	initCashOnHand?: number | null;
	lines?: CashTransactionReportLine[] | null;
}

export interface CustomerInvoiceLine {
	date?: string | null;
	refNo?: string | null;
	term?: number | null;
	startDate?: string | null;
	dueDate?: string | null;
	amount?: number | null;
	total?: number | null;
	remaining?: number | null;
}

export interface CustomerPaymentLine {
	date?: string | null;
	refNo?: string | null;
	openAmount?: number | null;
	received?: number | null;
}

export interface CustomerTransactionDetailGroup {
	no?: number | null;
	customerName?: string | null;
	invoices?: CustomerInvoiceLine[] | null;
	payments?: CustomerPaymentLine[] | null;
}

export interface OpenInvoiceReportLine {
	date?: string | null;
	refNo?: string | null;
	originalAmount?: number | null;
}

export interface OpenInvoiceCycleGroup {
	cycleStartDate?: string | null;
	cycleEndDate?: string | null;
	totalOriginalAmount?: number | null;
	totalPaidAmount?: number | null;
	balance?: number | null;
	invoices?: OpenInvoiceReportLine[] | null;
}

export interface OpenInvoiceCustomerGroup {
	customerName?: string | null;
	cycles?: OpenInvoiceCycleGroup[] | null;
}
