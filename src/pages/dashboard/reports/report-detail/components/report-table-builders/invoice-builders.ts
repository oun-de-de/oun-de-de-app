import type { Invoice, InvoiceExportLineResult, InvoiceExportPreviewRow } from "@/core/types/invoice";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";
import {
	buildReportRows as buildExportReportRows,
	mapExportLineToPreviewRow,
	resolveBalance,
	resolveOriginalAmount,
} from "../../../../invoice/export-preview/utils/export-preview-rows";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";

export function mapExportLinesToPreviewRows(exportLines: InvoiceExportLineResult[]): InvoiceExportPreviewRow[] {
	return exportLines.map(mapExportLineToPreviewRow);
}

export function buildInvoiceReportRows(exportLines: InvoiceExportLineResult[]): ReportTemplateRow[] {
	return buildExportReportRows(exportLines.map(mapExportLineToPreviewRow));
}

export function buildSaleDetailRows(exportLines: InvoiceExportLineResult[]): ReportTemplateRow[] {
	return exportLines.map((line, index) => ({
		key: `${line.refNo ?? "sale"}-${line.productName ?? index}`,
		cells: {
			no: index + 1,
			date: formatDisplayDate(line.date ?? ""),
			refNo: line.refNo ?? "-",
			type: "Cash Sale",
			category: line.customerName ?? "-",
			item: line.productName ?? "-",
			qty: formatNumber(line.quantity ?? 0),
			price: formatNumber(line.pricePerProduct ?? 0),
			amount: formatNumber(line.amount ?? line.total ?? 0),
		},
	}));
}

export function buildCustomerTransactionRows(invoices: Invoice[]): ReportTemplateRow[] {
	return invoices.map((invoice, index) => ({
		key: invoice.id,
		cells: {
			no: index + 1,
			date: formatDisplayDate(invoice.date),
			refNo: invoice.refNo ?? "-",
			customer: invoice.customerName ?? "-",
			type: invoice.type ?? "-",
			amount: formatNumber(invoice.amount ?? 0),
			memo: "-",
		},
	}));
}

export function buildInvoiceSummaryRows(
	previewRows: InvoiceExportPreviewRow[],
	mode: "monthly" | "daily",
): ReportTemplateRow[] {
	const totalRevenue = previewRows.reduce((sum, row) => sum + (resolveOriginalAmount(row) ?? 0), 0);
	const totalReceived = previewRows.reduce((sum, row) => sum + (row.paid ?? 0), 0);
	const totalBalance = previewRows.reduce(
		(sum, row) => sum + (resolveBalance(row, resolveOriginalAmount(row)) ?? 0),
		0,
	);
	const totalCustomers = new Set(previewRows.map((row) => row.customerName).filter(Boolean)).size;
	const totalLines = previewRows.length;
	const estimatedExpense = Math.round(totalRevenue * 0.35);
	const netAmount = totalRevenue - estimatedExpense;

	const rows =
		mode === "monthly"
			? [
					{ label: "ចំណូលសរុបប្រចាំខែ", detail: `Total customers: ${totalCustomers}`, amount: totalRevenue },
					{ label: "ប្រាក់ទទួលបាន", detail: `Collected from ${totalLines} lines`, amount: totalReceived },
					{ label: "សមតុល្យនៅសល់", detail: "Outstanding invoice balance", amount: totalBalance },
					{ label: "ចំណាយប៉ាន់ស្មាន", detail: "Estimated operating expense", amount: estimatedExpense },
					{ label: "ចំណេញសុទ្ធ", detail: "Revenue - expense", amount: netAmount },
				]
			: [
					{ label: "ប្រតិបត្តិការលក់", detail: `Invoices / receipts: ${totalLines}`, amount: totalRevenue },
					{ label: "ចំនួនអតិថិជន", detail: `Active customers: ${totalCustomers}`, amount: totalCustomers },
					{ label: "ប្រាក់ទទួលបានថ្ងៃនេះ", detail: "Cash collected today", amount: totalReceived },
					{ label: "សមតុល្យនៅសល់", detail: "Remaining balance", amount: totalBalance },
					{ label: "ចំណាយប្រចាំថ្ងៃ", detail: "Estimated expense (35%)", amount: estimatedExpense },
					{ label: "សមតុល្យចុងថ្ងៃ", detail: "Daily net position", amount: netAmount },
				];

	return rows.map((row, index) => ({
		key: `${mode}-${index}`,
		cells: {
			label: row.label,
			detail: row.detail,
			amount: `${formatNumber(row.amount)} Riel`,
		},
	}));
}
