import type {
	ReportTemplateColumn,
	ReportTemplateRow,
	ReportTemplateSummaryRow,
} from "../components/layout/report-template-table";
import type { ReportColumnVisibility } from "../components/layout/report-toolbar";
import { SAMPLE_CYCLE_ROWS, SAMPLE_MAIN_ROWS } from "./components/report-table.mock";
import { REPORT_DEFAULT_DATE } from "./constants";
import type { MainReportRow } from "./types/report-table.types";

export interface ReportDefinition {
	slug: string;
	title: string;
	subtitle?: string;
	buildRows: (rows?: ReportTemplateRow[]) => ReportTemplateRow[];
	buildColumns: () => ReportTemplateColumn[];
	hiddenColumnKeys?: (showColumns?: ReportColumnVisibility) => string[];
	summaryRows?: ReportTemplateSummaryRow[];
}

type RowCells = ReportTemplateRow["cells"];

function createRow(key: string, cells: RowCells): ReportTemplateRow {
	return { key, cells };
}

function createTextColumn(id: string, header: string, align: "left" | "right" = "left"): ReportTemplateColumn {
	return {
		id,
		header,
		cell: ({ row }) => row.original.cells[id],
		meta: { align },
	};
}

function mapRows<T>(rows: T[], toRow: (item: T) => ReportTemplateRow): ReportTemplateRow[] {
	return rows.map(toRow);
}

function buildInvoiceRows(rows: ReportTemplateRow[] = []): ReportTemplateRow[] {
	const invoiceRows: MainReportRow[] =
		rows.length > 0
			? rows.map((row) => ({
					invoiceNo: String(row.cells.refNo ?? row.cells.no ?? "-"),
					invoiceDate: String(row.cells.date ?? REPORT_DEFAULT_DATE),
					customer: String(row.cells.customer ?? "-"),
					couponId: String(row.cells.category ?? "-"),
					cycle: String(row.cells.geography ?? "-"),
					amountVnd: String(row.cells.originalAmount ?? "0"),
					paymentTerm: String(row.cells.balance ?? "No"),
					createdBy: String(row.cells.employee ?? "-"),
				}))
			: SAMPLE_MAIN_ROWS;

	return mapRows(invoiceRows, (row) =>
		createRow(row.invoiceNo, {
			invoiceNo: row.invoiceNo,
			invoiceDate: row.invoiceDate,
			customer: row.customer,
			couponId: row.couponId,
			cycle: row.cycle,
			amountVnd: row.amountVnd,
			paymentTerm: row.paymentTerm,
			createdBy: row.createdBy,
		}),
	);
}

function buildInvoiceColumns(): ReportTemplateColumn[] {
	return [
		createTextColumn("invoiceNo", "Invoice No"),
		createTextColumn("invoiceDate", "Invoice Date"),
		createTextColumn("customer", "Customer"),
		createTextColumn("couponId", "Coupon ID"),
		createTextColumn("cycle", "Cycle"),
		createTextColumn("amountVnd", "Amount (VND)", "right"),
		createTextColumn("paymentTerm", "Payment Term"),
		createTextColumn("createdBy", "Created By"),
	];
}

function buildCycleRows(): ReportTemplateRow[] {
	return mapRows(SAMPLE_CYCLE_ROWS, (row) =>
		createRow(`${row.customer}-${row.cycle}`, {
			customer: row.customer,
			cycle: row.cycle,
			openingBalance: row.openingBalance,
			invoiceTotal: row.invoiceTotal,
			paid: row.paid,
			outstanding: row.outstanding,
		}),
	);
}

function buildCycleColumns(): ReportTemplateColumn[] {
	return [
		createTextColumn("customer", "Customer"),
		createTextColumn("cycle", "Cycle"),
		createTextColumn("openingBalance", "Opening Balance", "right"),
		createTextColumn("invoiceTotal", "Invoice Total", "right"),
		createTextColumn("paid", "Paid", "right"),
		createTextColumn("outstanding", "Outstanding", "right"),
	];
}

export const REPORT_REGISTRY: Record<string, ReportDefinition> = {
	"open-invoice-detail-by-customer": {
		slug: "open-invoice-detail-by-customer",
		title: "Invoice List Report",
		subtitle: REPORT_DEFAULT_DATE,
		buildRows: buildInvoiceRows,
		buildColumns: buildInvoiceColumns,
		hiddenColumnKeys: (showColumns) =>
			[
				showColumns?.refNo === false ? "couponId" : null,
				showColumns?.category === false ? "cycle" : null,
				showColumns?.phone === false ? "amountVnd" : null,
				showColumns?.geography === false ? "paymentTerm" : null,
				showColumns?.address === false ? "createdBy" : null,
			].filter((key): key is string => key !== null),
	},
	"open-invoice-on-period-by-group": {
		slug: "open-invoice-on-period-by-group",
		title: "Cycle Report",
		subtitle: REPORT_DEFAULT_DATE,
		buildRows: buildCycleRows,
		buildColumns: buildCycleColumns,
		summaryRows: [{ key: "formula", label: "", value: "Outstanding = Opening + Invoice Total - Paid" }],
	},
};

export const DEFAULT_REPORT_SLUG = "open-invoice-detail-by-customer";

export function getReportDefinition(slug?: string): ReportDefinition {
	if (slug && REPORT_REGISTRY[slug]) {
		return REPORT_REGISTRY[slug];
	}
	return REPORT_REGISTRY[DEFAULT_REPORT_SLUG];
}
