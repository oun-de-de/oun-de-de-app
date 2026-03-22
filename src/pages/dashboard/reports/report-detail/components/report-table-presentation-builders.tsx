import type { ReactNode } from "react";
import type { Customer } from "@/core/types/customer";
import type { InvoiceExportPreviewRow } from "@/core/types/invoice";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateId } from "../report-types";
import type {
	ReportTemplateMetaColumn,
	ReportTemplateRow,
	ReportTemplateSummaryRow,
} from "../../components/layout/report-template-table";
import type { ReportFiltersValue } from "./report-filters";
import { buildOpenInvoiceSummaryRows } from "./report-table-builders";
import { formatFilterDateForDisplay, formatFilterRange, parseNumericCell } from "./report-table-utils";

export interface ReportPresentation {
	headerContent: ReactNode;
	metaColumns?: ReportTemplateMetaColumn[];
	summaryRows?: ReportTemplateSummaryRow[];
	emptyText?: string;
	showTableHeader?: boolean;
}

type ReportPresentationBuilderParams = {
	templateId: ReportTemplateId;
	reportSlug: string;
	title: string;
	filters: ReportFiltersValue | undefined;
	selectedCustomerLabel: string | undefined;
	selectedCustomer: Customer | undefined;
	rows: ReportTemplateRow[];
	previewRows: InvoiceExportPreviewRow[];
};

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

function buildLedgerMetaColumns(): ReportTemplateMetaColumn[] {
	return [{ key: "currency", rows: ["Currency: KHR"], align: "left", className: "md:col-span-1" }];
}

function buildWorkbookFilterMetaColumns(
	filters: ReportFiltersValue | undefined,
	customerLabel?: string,
	selectedCustomer?: Customer,
): ReportTemplateMetaColumn[] {
	const fromDate = formatFilterDateForDisplay(filters?.fromDate);
	const toDate = formatFilterDateForDisplay(filters?.toDate);
	const dateRange = fromDate === toDate ? fromDate : `${fromDate} To ${toDate}`;
	const customerDisplay = selectedCustomer
		? `${selectedCustomer.code} : ${selectedCustomer.name}`
		: customerLabel?.trim() || "All";
	const geographyDisplay = selectedCustomer?.geography?.trim() || "All";
	const paymentTermDisplay = selectedCustomer?.paymentTerm?.duration
		? `${selectedCustomer.paymentTerm.duration} days`
		: "All";

	return [
		{ key: "date", rows: [dateRange], align: "left", className: "md:col-span-3" },
		{ key: "branch", rows: ["Branch:", "[All]"], align: "left", className: "md:col-span-1" },
		{ key: "term", rows: ["Term:", `[${paymentTermDisplay}]`], align: "left", className: "md:col-span-1" },
		{ key: "geography", rows: ["Geography:", `[${geographyDisplay}]`], align: "left", className: "md:col-span-1" },
		{ key: "customer", rows: ["Customer:", `[${customerDisplay}]`], align: "left", className: "md:col-span-3" },
	];
}

function buildCustomerLoanMetaColumns(): ReportTemplateMetaColumn[] {
	return [
		{ key: "title", rows: ["Customer Borrow Money"], className: "md:col-span-1" },
		{ key: "term", rows: ["Payment term: Monthly Installments"], align: "center", className: "md:col-span-1" },
		{ key: "scope", rows: ["Borrower type: Customer"], align: "right", className: "md:col-span-1" },
	];
}

function buildEmployeeLoanMetaColumns(): ReportTemplateMetaColumn[] {
	return [
		{ key: "title", rows: ["Employee Borrow Money"], className: "md:col-span-1" },
		{ key: "term", rows: ["Payment term: Monthly Installments"], align: "center", className: "md:col-span-1" },
		{ key: "scope", rows: ["Employee Loan Ledger"], align: "right", className: "md:col-span-1" },
	];
}

function buildCompanyAssetMetaColumns(): ReportTemplateMetaColumn[] {
	return [
		{ key: "scope", rows: ["Company Asset Register", "Source: product catalog records"], className: "md:col-span-1" },
		{
			key: "supplier",
			rows: ["Supplier fields are derived from product reference only", "No supplier data in current source data"],
			align: "center",
			className: "md:col-span-1",
		},
		{
			key: "valuation",
			rows: ["Balance is based on quantity x cost", "Credit remains blank in current source data"],
			align: "right",
			className: "md:col-span-1",
		},
	];
}

function sumCell(rows: ReportTemplateRow[], cellKey: string) {
	return rows.reduce((sum, row) => sum + parseNumericCell(row.cells[cellKey]), 0);
}

function sumLatestBalanceByItem(rows: ReportTemplateRow[]): number {
	const latestBalanceByItem = new Map<string, number>();

	for (const row of rows) {
		const itemKey =
			String(row.cells.itemCode ?? "").trim() || String(row.cells.balanceName ?? "").trim() || String(row.key);

		latestBalanceByItem.set(itemKey, parseNumericCell(row.cells.balanceQty));
	}

	return [...latestBalanceByItem.values()].reduce((sum, balance) => sum + balance, 0);
}

function toSummaryRows(items: SummaryDefinition[]): ReportTemplateSummaryRow[] {
	return items.map((item) => ({ key: item.key, label: item.label, value: item.value }));
}

function buildSingleAmountSummary(
	key: string,
	label: string,
	amount: unknown,
	suffix = "",
): ReportTemplateSummaryRow[] {
	return toSummaryRows([{ key, label, value: `${formatNumber(parseNumericCell(amount))}${suffix}` }]);
}

function buildDebitCreditSummary(prefix: string, rows: ReportTemplateRow[]): ReportTemplateSummaryRow[] {
	return toSummaryRows([
		{ key: `${prefix}-debit`, label: "Total debit", value: formatNumber(sumCell(rows, "debit")) },
		{ key: `${prefix}-credit`, label: "Total credit", value: formatNumber(sumCell(rows, "credit")) },
	]);
}

function buildSimplePresentation(
	title: string,
	dateText: string,
	options?: {
		metaColumns?: ReportTemplateMetaColumn[];
		summaryRows?: ReportTemplateSummaryRow[];
		emptyText?: string;
		showTableHeader?: boolean;
	},
): ReportPresentation {
	return {
		headerContent: buildDefaultHeader(title, dateText),
		metaColumns: options?.metaColumns,
		summaryRows: options?.summaryRows,
		emptyText: options?.emptyText,
		showTableHeader: options?.showTableHeader,
	};
}

function buildMonthlyPresentation({ filters, rows }: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation("Revenue and Expense Statement", formatFilterRange(filters), {
		summaryRows: buildSingleAmountSummary("monthly-total", "Net total", rows.at(-1)?.cells.amount, " Riel"),
		emptyText: "No monthly data available.",
	});
}

function buildDailyPresentation({ title, filters, rows }: ReportPresentationBuilderParams): ReportPresentation {
	const dateText = formatFilterRange(filters);
	const dailyCashReceive = rows.find((row) => row.cells.metricKey === "daily-cash-receive")?.cells.amount;
	const dailyExpense = rows.find((row) => row.cells.metricKey === "daily-expense-total")?.cells.amount;

	return buildSimplePresentation(title, dateText, {
		showTableHeader: false,
		summaryRows: toSummaryRows([
			{
				key: "daily-net-cash",
				label: "Cash balance after expense",
				value: `${formatNumber(parseNumericCell(dailyCashReceive) - parseNumericCell(dailyExpense))} KHR`,
			},
		]),
		emptyText: "No daily data available.",
	});
}

function buildCompanyAssetPresentation({ filters, rows }: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation("Company Asset Report", formatFilterRange(filters), {
		metaColumns: buildCompanyAssetMetaColumns(),
		summaryRows: buildSingleAmountSummary("asset-total", "Total asset value", sumCell(rows, "balance")),
		emptyText: "No asset rows available.",
	});
}

function buildLedgerPresentation({
	title,
	filters,
	rows,
	reportSlug,
}: ReportPresentationBuilderParams): ReportPresentation {
	const prefix = reportSlug === "trial-balance" ? "trial" : "ledger";
	return buildSimplePresentation(title, formatFilterRange(filters), {
		metaColumns: buildLedgerMetaColumns(),
		summaryRows: buildDebitCreditSummary(prefix, rows),
	});
}

function buildInventoryPresentation({ filters, rows }: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation("Inventory Stock Report", formatFilterRange(filters), {
		summaryRows: buildSingleAmountSummary("inventory-balance", "Total balance qty", sumLatestBalanceByItem(rows)),
	});
}

function buildCustomerLoanPresentation({ filters, rows }: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation("Customer Borrow Money", formatFilterRange(filters), {
		metaColumns: buildCustomerLoanMetaColumns(),
		summaryRows: toSummaryRows([
			{ key: "loan-debit", label: "Total principal", value: formatNumber(sumCell(rows, "debit")) },
			{ key: "loan-credit", label: "Total collected", value: formatNumber(sumCell(rows, "credit")) },
			{ key: "loan-balance", label: "Outstanding balance", value: formatNumber(sumCell(rows, "balance")) },
		]),
		emptyText: "No customer loans found.",
	});
}

function buildEmployeeLoanPresentation({ title, filters, rows }: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation(title, formatFilterRange(filters), {
		metaColumns: buildEmployeeLoanMetaColumns(),
		summaryRows: buildDebitCreditSummary("employee-loan", rows),
		emptyText: "No employee loans found.",
	});
}

function buildSaleDetailPresentation({ title, filters, rows }: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation(title, formatFilterRange(filters), {
		summaryRows: buildSingleAmountSummary("sales-total", "Total amount", sumCell(rows, "amount")),
	});
}

function buildOpenInvoicePresentation(params: ReportPresentationBuilderParams): ReportPresentation {
	const { title, filters, selectedCustomerLabel, selectedCustomer, rows, previewRows } = params;
	const openInvoiceRows = rows.map((row) => ({
		refNo: String(row.cells.refNo ?? ""),
		customerName: String(row.cells.customer ?? ""),
		amount: parseNumericCell(row.cells.originalAmount),
	}));
	const { customerCount, totalBalance } = buildOpenInvoiceSummaryRows(openInvoiceRows, previewRows);

	return buildSimplePresentation(title, formatFilterRange(filters), {
		metaColumns: buildWorkbookFilterMetaColumns(filters, selectedCustomerLabel, selectedCustomer),
		summaryRows: [
			{ key: "invoice-customers", label: "Total customer", value: customerCount },
			{ key: "invoice-balance", label: "Total balance", value: `${formatNumber(totalBalance)} ៛` },
		],
	});
}

const PRESENTATION_BUILDERS: Partial<
	Record<ReportTemplateId, (params: ReportPresentationBuilderParams) => ReportPresentation>
> = {
	"monthly-revenue-expense-summary": buildMonthlyPresentation,
	"daily-report-summary": buildDailyPresentation,
	"company-asset-register": buildCompanyAssetPresentation,
	"income-expense-ledger": buildLedgerPresentation,
	"ice-bag-inventory-stock-report": buildInventoryPresentation,
	"customer-loan-register": buildCustomerLoanPresentation,
	"employee-loan-ledger": buildEmployeeLoanPresentation,
	"sale-detail-by-customer": buildSaleDetailPresentation,
	"open-invoice-detail-by-customer": buildOpenInvoicePresentation,
};

export function buildReportPresentation(params: ReportPresentationBuilderParams): ReportPresentation {
	const builder = PRESENTATION_BUILDERS[params.templateId];
	if (builder) return builder(params);
	return buildSimplePresentation(params.title, formatFilterRange(params.filters));
}
