import { EXPORT_PREVIEW_COLUMNS } from "../../invoice/export-preview/components/export-preview-columns";
import type { ReportTemplateColumn, ReportTemplateSummaryRow } from "../components/layout/report-template-table";
import type { ReportColumnVisibility } from "../components/layout/report-toolbar";
import { REPORT_DEFAULT_DATE } from "./constants";

export interface ReportDefinition {
	slug: string;
	title: string;
	subtitle?: string;
	buildColumns: () => ReportTemplateColumn[];
	hiddenColumnKeys?: (showColumns?: ReportColumnVisibility) => string[];
	columnLabels?: Partial<Record<keyof ReportColumnVisibility, string>>;
	summaryRows?: ReportTemplateSummaryRow[];
}

function createTextColumn(id: string, header: string, align: "left" | "right" = "left"): ReportTemplateColumn {
	return {
		id,
		header,
		cell: ({ row }) => row.original.cells[id],
		meta: { align },
	};
}

const INVOICE_REPORT_COLUMN_LABELS: Partial<Record<keyof ReportColumnVisibility, string>> = {
	refNo: "Ref No",
	category: "Customer",
	geography: "Date",
	address: "Memo",
	phone: "Balance",
};

function buildInvoiceHiddenColumnKeys(showColumns?: ReportColumnVisibility): string[] {
	return [
		showColumns?.refNo === false ? "refNo" : null,
		showColumns?.category === false ? "customer" : null,
		showColumns?.geography === false ? "date" : null,
		showColumns?.address === false ? "memo" : null,
		showColumns?.phone === false ? "balance" : null,
	].filter((key): key is string => key !== null);
}

function buildCycleColumns(): ReportTemplateColumn[] {
	return [
		createTextColumn("customer", "Customer"),
		createTextColumn("cycle", "Cycle"),
		createTextColumn("openingBalance", "Opening Balance"),
		createTextColumn("invoiceTotal", "Invoice Total"),
		createTextColumn("paid", "Paid"),
	];
}

export const REPORT_REGISTRY: Record<string, ReportDefinition> = {
	"open-invoice-detail-by-customer": {
		slug: "open-invoice-detail-by-customer",
		title: "Invoice List Report",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: () => EXPORT_PREVIEW_COLUMNS,
		columnLabels: INVOICE_REPORT_COLUMN_LABELS,
		hiddenColumnKeys: buildInvoiceHiddenColumnKeys,
	},
	"open-invoice-on-period-by-group": {
		slug: "open-invoice-on-period-by-group",
		title: "Cycle Report",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCycleColumns,
	},
	"receipt-detail-by-customer": {
		slug: "receipt-detail-by-customer",
		title: "Receipt Detail By Customer",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: () => EXPORT_PREVIEW_COLUMNS,
		columnLabels: INVOICE_REPORT_COLUMN_LABELS,
		hiddenColumnKeys: buildInvoiceHiddenColumnKeys,
	},
};

export const DEFAULT_REPORT_SLUG = "open-invoice-detail-by-customer";

export function getReportDefinition(slug?: string): ReportDefinition {
	if (slug && REPORT_REGISTRY[slug]) {
		return REPORT_REGISTRY[slug];
	}
	return REPORT_REGISTRY[DEFAULT_REPORT_SLUG];
}
