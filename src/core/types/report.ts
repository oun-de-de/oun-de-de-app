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

// BE TODO (found 2026-09-15 ref-no link sweep): no id/invoiceId field at all, and no document-type
// field — refNo cannot be linked to /dashboard/invoice/export-preview. Same gap as
// CashTransactionReportLine below and CashTransactionFlattenResult in core/types/cash-transaction.ts.
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

/**
 * BE TODO (reported 2026-09-11): /reports/cash-transaction-report only returns DEBIT/CREDIT for
 * `type`, so the UI cannot show a real document category (Invoice/Revenue/Expense/Loan…) the way
 * the reference report does. Needs a category/source-document field on each line — refNo alone
 * ("CT<timestamp>" for manual entries) does not encode it. See mapApiLinesToCashItems in
 * report-table-builders/accounting-builders.ts for the current (incomplete) fallback.
 */
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

// BE TODO (spec item #9, "open-invoice-on-period-by-group": select date and Item for customer's
// invoice — reported 2026-09-15): this line has no product/item field, so the report cannot filter
// or display by Item. Needs a productName (or item list) field per invoice line before an Item
// filter can be added to this report. Date filter already works (filterConfig.dateRange).
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
