import type { ReportTemplateColumn } from "../../components/layout/report-template-table";
import type { ReportColumnVisibility } from "../../components/layout/report-toolbar";
import { buildSizedColumns } from "../report-column-helpers";

export const INVOICE_REPORT_COLUMN_LABELS: Partial<Record<keyof ReportColumnVisibility, string>> = {
	refNo: "Ref No",
	category: "Customer",
	geography: "Date",
	address: "Memo",
	phone: "Balance",
};

export const SALE_DETAIL_REPORT_COLUMN_LABELS: Partial<Record<keyof ReportColumnVisibility, string>> = {
	refNo: "Ref No",
	category: "Category",
	geography: "Date",
	address: "Item",
	phone: "Amount",
};

export function buildInvoiceHiddenColumnKeys(showColumns?: ReportColumnVisibility): string[] {
	return [
		showColumns?.refNo === false ? "refNo" : null,
		showColumns?.category === false ? "customer" : null,
		showColumns?.geography === false ? "date" : null,
		showColumns?.address === false ? "memo" : null,
		showColumns?.phone === false ? "balance" : null,
	].filter((key): key is string => key !== null);
}

export function buildSaleDetailHiddenColumnKeys(showColumns?: ReportColumnVisibility): string[] {
	return [
		showColumns?.refNo === false ? "refNo" : null,
		showColumns?.category === false ? "category" : null,
		showColumns?.geography === false ? "date" : null,
		showColumns?.address === false ? "item" : null,
		showColumns?.phone === false ? "amount" : null,
	].filter((key): key is string => key !== null);
}

export function buildOpenInvoiceDetailColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "No", "w-[5%]", "center"],
		["customer", "Customer", "w-[20%]"],
		["date", "Date", "w-[11%]", "center"],
		["refNo", "Ref NO", "w-[14%]"],
		["employee", "Employee", "w-[14%]"],
		["originalAmount", "Original Amount", "w-[12%]", "right"],
		["received", "Received", "w-[12%]", "right"],
		["balance", "Balance", "w-[12%]", "right"],
	]);
}

export function buildSaleDetailColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "NO", "w-[4%]", "center"],
		["customer", "CUSTOMER", "w-[17%]"],
		["date", "DATE", "w-[11%]", "center"],
		["refNo", "REF NO", "w-[12%]"],
		["type", "TYPE", "w-[8%]", "center"],
		["category", "CATEGORY", "w-[12%]"],
		["item", "ITEM", "w-[12%]"],
		["qty", "QTY", "w-[6%]", "right"],
		["price", "PRICE", "w-[8%]", "right"],
		["amount", "AMOUNT", "w-[10%]", "right"],
	]);
}

export function buildReceiptDetailColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "No", "w-[5%]", "center"],
		["customer", "Customer", "w-[20%]"],
		["date", "Date", "w-[11%]", "center"],
		["refNo", "Ref NO", "w-[14%]"],
		["employee", "Employee", "w-[14%]"],
		["originalAmount", "Original Amount", "w-[12%]", "right"],
		["received", "Received", "w-[12%]", "right"],
		["balance", "Balance", "w-[12%]", "right"],
	]);
}

export function buildCustomerTransactionDetailByTypeColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "No", "w-[3.5%]", "center"],
		["date", "Date", "w-[15%]"],
		["refNo", "Ref NO", "w-[12%]"],
		["category", "Category", "w-[8%]"],
		["term", "Term", "w-[6%]"],
		["dueDate", "Due Date", "w-[9%]"],
		["qty", "Qty", "w-[5.5%]", "right"],
		["amount", "Amount", "w-[11%]", "right"],
		["discount", "Dis($)", "w-[6%]", "right"],
		["total", "Total", "w-[12%]", "right"],
		["remaining", "Remaining", "w-[12%]", "right"],
	]);
}
