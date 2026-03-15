import type { Invoice, InvoiceExportLineApi, InvoiceExportPreviewRow } from "@/core/types/invoice";
import { formatFlexibleDisplayDate } from "@/core/utils/date-display";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import {
	buildInvoiceTypeMap,
	getCustomerSaleType,
	getNotificationText,
	getOpenInvoiceMetrics,
	getProductCategory,
	groupPreviewRowsByRefNo,
} from "./invoice-builder-helpers";
import { createIndexedReportRow } from "./report-row-helpers";

export { buildInvoiceReportRows, mapExportLinesToPreviewRows } from "./invoice-builder-helpers";

export function buildOpenInvoiceSummaryRows(
	invoices: Array<Pick<Invoice, "refNo" | "customerName" | "amount">>,
	previewRows: InvoiceExportPreviewRow[],
): { customerCount: number; totalBalance: number } {
	const rowsByRefNo = groupPreviewRowsByRefNo(previewRows);
	const customerNames = new Set<string>();

	const totalBalance = invoices.reduce((sum, invoice) => {
		if (invoice.customerName) customerNames.add(invoice.customerName);
		return sum + getOpenInvoiceMetrics(invoice, rowsByRefNo).balance;
	}, 0);

	return {
		customerCount: customerNames.size,
		totalBalance,
	};
}

export function buildOpenInvoiceRows(invoices: Invoice[], previewRows: InvoiceExportPreviewRow[]): ReportTemplateRow[] {
	const rowsByRefNo = groupPreviewRowsByRefNo(previewRows);

	return invoices.map((invoice, index) => {
		const { originalAmount, received, balance } = getOpenInvoiceMetrics(invoice, rowsByRefNo);

		return createIndexedReportRow(invoice.id, index, {
			customer: invoice.customerName ?? "-",
			date: formatFlexibleDisplayDate(invoice.date),
			refNo: invoice.refNo ?? "-",
			employee: invoice.createdBy ?? "-",
			originalAmount: formatNumber(originalAmount),
			received: formatNumber(received),
			balance: formatNumber(balance),
			paymentTerm: invoice.paymentTerm ?? "-",
			notification: getNotificationText(originalAmount),
		});
	});
}

export function buildCustomerTransactionRows(invoices: Invoice[]): ReportTemplateRow[] {
	return invoices.map((invoice, index) =>
		createIndexedReportRow(invoice.id, index, {
			date: formatFlexibleDisplayDate(invoice.date),
			refNo: invoice.refNo ?? "-",
			customer: invoice.customerName ?? "-",
			type: getCustomerSaleType(invoice),
			amount: formatNumber(invoice.amount ?? 0),
			memo: "-",
		}),
	);
}

export function buildSaleDetailRows(invoices: Invoice[], exportLines: InvoiceExportLineApi[]): ReportTemplateRow[] {
	const typeByRefNo = buildInvoiceTypeMap(invoices);

	return exportLines.map((line, index) => {
		const displayType = typeByRefNo.get(line.refNo ?? "") ?? "cash_sale";

		return createIndexedReportRow(`${line.refNo ?? "sale"}-${line.productName ?? index}`, index, {
			date: formatFlexibleDisplayDate(line.date),
			refNo: line.refNo ?? "-",
			type: displayType,
			category: getProductCategory(line.productName),
			item: line.productName ?? "-",
			qty: formatNumber(line.quantity ?? 0),
			price: formatNumber(line.pricePerProduct ?? 0),
			amount: formatNumber(line.amount ?? line.total ?? 0),
		});
	});
}
