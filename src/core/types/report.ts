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
