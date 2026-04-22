import { EXPORT_PREVIEW_COLUMNS } from "../../../invoice/export-preview/components/export-preview-columns";
import type { ReportColumnVisibility } from "../../components/layout/report-toolbar";
import type { ReportTemplateColumn } from "../../components/layout/report-template-table";
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
		["no", "NO", "w-[5%]", "center"],
		["customer", "CUSTOMER", "w-[18%]"],
		["date", "DATE", "w-[11%]", "center"],
		["refNo", "REF NO", "w-[14%]"],
		["employee", "EMPLOYEE", "w-[12%]"],
		["originalAmount", "ORIGINAL AMOUNT", "w-[12%]", "right"],
		["received", "RECEIVED", "w-[10%]", "right"],
		["balance", "BALANCE", "w-[10%]", "right"],
		["paymentTerm", "PAYMENT TERM", "w-[13%]"],
		["notification", "NOTIFICATION ALERT", "w-[15%]"],
	]);
}

export function buildSaleDetailColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "NO", "w-[5%]", "center"],
		["customer", "CUSTOMER", "w-[16%]"],
		["date", "DATE", "w-[11%]", "center"],
		["refNo", "REF NO", "w-[13%]"],
		["type", "TYPE", "w-[10%]", "center"],
		["category", "CATEGORY", "w-[14%]"],
		["item", "ITEM", "w-[13%]"],
		["qty", "QTY", "w-[6%]", "right"],
		["price", "PRICE", "w-[7%]", "right"],
		["amount", "AMOUNT", "w-[10%]", "right"],
	]);
}

export function buildReceiptDetailColumns(): ReportTemplateColumn[] {
	return EXPORT_PREVIEW_COLUMNS;
}
