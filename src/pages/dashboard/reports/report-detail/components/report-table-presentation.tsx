import type { ReactNode } from "react";
import Icon from "@/core/components/icon/icon";
import type { InvoiceExportPreviewRow } from "@/core/types/invoice";
import { formatNumber } from "@/core/utils/formatters";
import { resolveBalance, resolveOriginalAmount } from "../../../invoice/export-preview/utils/export-preview-rows";
import type {
	ReportTemplateMetaColumn,
	ReportTemplateRow,
	ReportTemplateSummaryRow,
} from "../../components/layout/report-template-table";
import type { ReportFiltersValue } from "./report-filters";
import { formatFilterRange, parseNumericCell } from "./report-table-utils";

export interface ReportPresentation {
	headerContent: ReactNode;
	metaColumns?: ReportTemplateMetaColumn[];
	summaryRows?: ReportTemplateSummaryRow[];
	emptyText?: string;
}

type SummaryDefinition = {
	key: string;
	label: string;
	value: string | number;
};

function buildDefaultHeader(title: string, dateText: string) {
	return (
		<div className="flex flex-col items-center gap-1 text-center text-black">
			<div className="text-[11px] font-normal">{title}</div>
			<div className="pb-0 text-[22px] font-bold">ហាងចក្រទឹកកក លឹម ច័ន្ទ II</div>
			<div className="pb-3 text-[13px] font-semibold underline">TEL: 070669898</div>
			<div className="text-base font-semibold text-slate-600">{dateText}</div>
		</div>
	);
}

function buildWorkbookHeader(title: string, subtitle: string) {
	return (
		<div className="overflow-hidden border border-black">
			<div className="grid grid-cols-[120px_1fr] items-center border-b border-black bg-white">
				<div className="flex items-center justify-center border-r border-black p-4">
					<Icon icon="local:ic-logo-badge" size={72} />
				</div>
				<div className="py-8 text-center text-[18px] font-bold text-black">{title}</div>
			</div>
			<div className="border-b border-black bg-[#d79b9b] px-4 py-3 text-center text-[15px] font-semibold text-black">
				{subtitle}
			</div>
		</div>
	);
}

function buildLedgerMetaColumns(filters?: ReportFiltersValue): ReportTemplateMetaColumn[] {
	return [
		{ key: "branch", rows: ['Branch: ["01 : ភ្នំពេញ"]'], className: "md:col-span-1" },
		{ key: "currency", rows: ["Currency: KHR"], align: "center", className: "md:col-span-1" },
		{ key: "range", rows: [formatFilterRange(filters)], align: "right", className: "md:col-span-1" },
	];
}

function getSummaryAmount(rows: ReportTemplateRow[]) {
	return parseNumericCell(rows.at(-1)?.cells.amount);
}

function sumCell(rows: ReportTemplateRow[], cellKey: string) {
	return rows.reduce((sum, row) => sum + parseNumericCell(row.cells[cellKey]), 0);
}

function toSummaryRows(items: SummaryDefinition[]): ReportTemplateSummaryRow[] {
	return items.map((item) => ({
		key: item.key,
		label: item.label,
		value: item.value,
	}));
}

function buildWorkbookPresentation(
	workbookTitle: string,
	workbookSubtitle: string,
	summaryRows?: ReportTemplateSummaryRow[],
	emptyText?: string,
): ReportPresentation {
	return {
		headerContent: buildWorkbookHeader(workbookTitle, workbookSubtitle),
		summaryRows,
		emptyText,
	};
}

function buildLedgerPresentation(
	title: string,
	dateText: string,
	filters: ReportFiltersValue | undefined,
	summaryRows?: ReportTemplateSummaryRow[],
	emptyText?: string,
): ReportPresentation {
	return {
		headerContent: buildDefaultHeader(title, dateText),
		metaColumns: buildLedgerMetaColumns(filters),
		summaryRows,
		emptyText,
	};
}

export function buildReportPresentation(
	reportSlug: string,
	title: string,
	filters: ReportFiltersValue | undefined,
	rows: ReportTemplateRow[],
	previewRows: InvoiceExportPreviewRow[],
): ReportPresentation {
	const dateText = formatFilterRange(filters);

	if (reportSlug === "profit-and-loss") {
		const totalAmount = getSummaryAmount(rows);
		return buildWorkbookPresentation(
			"របាយការណ៍ចំណូល និង ចំណាយ",
			"ប្រចាំខែ",
			toSummaryRows([{ key: "monthly-total", label: "Net total", value: `${formatNumber(totalAmount)} Riel` }]),
			"No monthly data available.",
		);
	}

	if (reportSlug === "daily-report") {
		const totalAmount = getSummaryAmount(rows);
		return buildWorkbookPresentation(
			"របាយការណ៍ប្រចាំថ្ងៃ",
			"Daily report",
			toSummaryRows([{ key: "daily-total", label: "End of day balance", value: `${formatNumber(totalAmount)} Riel` }]),
			"No daily data available.",
		);
	}

	if (reportSlug === "company-asset") {
		return buildWorkbookPresentation(
			"របាយការណ៍ទ្រព្យសកម្មរបស់ក្រុមហ៊ុន",
			"Company Asset",
			toSummaryRows([
				{ key: "asset-total", label: "Total asset value", value: formatNumber(sumCell(rows, "balance")) },
			]),
			"No asset rows available.",
		);
	}

	if (reportSlug === "general-ledger" || reportSlug === "balance-sheet") {
		return buildLedgerPresentation(
			title,
			dateText,
			filters,
			toSummaryRows([
				{ key: "ledger-debit", label: "Total debit", value: formatNumber(sumCell(rows, "debit")) },
				{ key: "ledger-credit", label: "Total credit", value: formatNumber(sumCell(rows, "credit")) },
			]),
		);
	}

	if (reportSlug === "trial-balance") {
		return buildLedgerPresentation(
			title,
			dateText,
			filters,
			toSummaryRows([
				{ key: "trial-debit", label: "Total debit", value: formatNumber(sumCell(rows, "debit")) },
				{ key: "trial-credit", label: "Total credit", value: formatNumber(sumCell(rows, "credit")) },
			]),
		);
	}

	if (reportSlug === "inventory-stock-status") {
		return buildWorkbookPresentation(
			"Inventory Stock Report",
			"Q#8 Ice Bag Inventory",
			toSummaryRows([
				{ key: "inventory-balance", label: "Total balance qty", value: formatNumber(sumCell(rows, "balanceQty")) },
			]),
		);
	}

	if (reportSlug === "customer-transaction") {
		return buildWorkbookPresentation(
			"អតិថិជនខ្ចីប្រាក់",
			"Customer Loan Register",
			toSummaryRows([
				{ key: "loan-debit", label: "Total principal", value: formatNumber(sumCell(rows, "debit")) },
				{ key: "loan-credit", label: "Total collected", value: formatNumber(sumCell(rows, "credit")) },
				{ key: "loan-balance", label: "Outstanding balance", value: formatNumber(sumCell(rows, "balance")) },
			]),
			"No customer loans found.",
		);
	}

	if (reportSlug === "customer-transaction-detail-by-type") {
		return buildLedgerPresentation(
			title,
			dateText,
			filters,
			toSummaryRows([
				{ key: "employee-loan-debit", label: "Total debit", value: formatNumber(sumCell(rows, "debit")) },
				{ key: "employee-loan-credit", label: "Total credit", value: formatNumber(sumCell(rows, "credit")) },
			]),
			"No employee loans found.",
		);
	}

	if (reportSlug === "sale-detail-by-customer") {
		return {
			headerContent: buildDefaultHeader(title, dateText),
			summaryRows: toSummaryRows([
				{ key: "sales-total", label: "Total amount", value: formatNumber(sumCell(rows, "amount")) },
			]),
		};
	}

	if (reportSlug === "open-invoice-detail-by-customer") {
		const customerCount = new Set(previewRows.map((row) => row.customerName)).size;
		const totalBalance = previewRows.reduce(
			(sum, row) => sum + (resolveBalance(row, resolveOriginalAmount(row)) ?? 0),
			0,
		);
		return {
			headerContent: buildDefaultHeader(title, dateText),
			summaryRows: [
				{ key: "invoice-customers", label: "Total customer", value: customerCount },
				{ key: "invoice-balance", label: "Total balance", value: `${formatNumber(totalBalance)} ៛` },
			],
		};
	}

	return {
		headerContent: buildDefaultHeader(title, dateText),
	};
}
