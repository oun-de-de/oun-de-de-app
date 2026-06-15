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
import { createIndexedReportRow, createReportRow } from "./report-row-helpers";

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
	const groups = new Map<string, InvoiceExportLineApi[]>();
	const groupOrder: string[] = [];

	for (const line of exportLines) {
		// Use trimmed customer name as group key
		const groupKey = (line.customerName ?? "").trim() || "Unknown customer";
		// Initialize group if it doesn't exist
		if (!groups.has(groupKey)) {
			// Create a new group
			groups.set(groupKey, []);
			// Maintain the order of groups as they first appear
			groupOrder.push(groupKey);
		}
		// Add line to the appropriate group
		groups.get(groupKey)?.push(line);
	}

	return groupOrder.flatMap((customerName, groupIndex) => {
		const customerLines = groups.get(customerName) ?? [];
		const totalQuantity = customerLines.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
		const totalAmount = customerLines.reduce((sum, line) => sum + (line.amount ?? line.total ?? 0), 0);

		const headerRow = createReportRow(`customer-group-${groupIndex}-${customerName}`, {
			no: groupIndex + 1,
			customer: customerName,
			date: "",
			refNo: "",
			type: "",
			category: "",
			item: "",
			qty: "",
			price: "",
			amount: "",
		});
		headerRow.rowClassName = "font-semibold";
		headerRow.cellClassNames = {
			customer: "font-semibold",
		};

		const detailRows = customerLines.map((line, lineIndex) => {
			const displayType = typeByRefNo.get(line.refNo ?? "") ?? "cash_sale";

			return createReportRow(`sale-${groupIndex}-${lineIndex}-${line.refNo ?? "ref"}-${line.productName ?? "item"}`, {
				no: "",
				customer: "",
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

		const totalRow = createReportRow(`customer-group-${groupIndex}-${customerName}-total`, {
			no: "",
			customer: "",
			date: "",
			refNo: "",
			type: "",
			category: "",
			item: `TOTAL(${customerLines.length})`,
			qty: formatNumber(totalQuantity),
			price: "",
			amount: formatNumber(totalAmount),
		});
		totalRow.rowClassName = "font-semibold";
		totalRow.cellClassNames = {
			item: "text-right",
			qty: "text-right",
			amount: "text-right",
		};

		return [headerRow, ...detailRows, totalRow];
	});
}
