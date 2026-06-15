import type { ReactNode } from "react";
import PremiumIceLogo from "@/assets/icons/ic-premium-ice.png";
import type { Customer } from "@/core/types/customer";
import type { InvoiceExportPreviewRow } from "@/core/types/invoice";
import { formatNumber } from "@/core/utils/formatters";
import type {
	ReportTemplateMetaColumn,
	ReportTemplateRow,
	ReportTemplateSummaryRow,
} from "../../components/layout/report-template-table";
import { REPORT_TITLES } from "../../report-titles";
import { REPORT_KHMER_TITLE } from "../constants";
import type { ReportFilterConfig, ReportTemplateId } from "../report-types";
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
	filterConfig?: ReportFilterConfig;
	filters: ReportFiltersValue | undefined;
	selectedCustomerLabel: string | undefined;
	selectedCustomer: Customer | undefined;
	selectedCustomerTypeLabel?: string;
	customerTypeCustomerCount?: number;
	rows: ReportTemplateRow[];
	previewRows: InvoiceExportPreviewRow[];
};

type SummaryDefinition = {
	key: string;
	label: string;
	value: string | number;
};

function buildDefaultHeader(title: string, dateText?: string) {
	return (
		<div className="flex flex-col gap-0 text-black">
			<div className="flex items-center justify-between px-4 py-3">
				<div className="flex w-20 justify-start">
					<div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-sky-500 bg-white">
						<img
							src={PremiumIceLogo}
							alt="Premium Ice Logo"
							width={80}
							height={80}
							className="size-full object-cover"
						/>
					</div>
				</div>
				<div className="flex-1 text-center">
					<div className="text-[11px] font-normal text-slate-600">{title}</div>
					<div className="mt-1 text-[22px] font-bold">{REPORT_KHMER_TITLE}</div>
					<div className="mt-2 text-[13px] font-semibold text-slate-600">
						ទីតាំង : ភូមិត្រពាំងក្រសាំង សង្កាត់កន្ទោក ខណ្ឌកំបូល រាជធានីភ្នំពេញ (TEL: 070 66 9898)
					</div>
				</div>
				<div className="w-20" />
			</div>
			{dateText && (
				<div className="flex justify-center">
					<div className="text-base font-semibold text-slate-600">{dateText}</div>
				</div>
			)}
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
	selectedCustomerTypeLabel?: string,
	customerTypeCustomerCount?: number,
): ReportTemplateMetaColumn[] {
	const fromDate = formatFilterDateForDisplay(filters?.fromDate);
	const toDate = formatFilterDateForDisplay(filters?.toDate);
	const dateRange = fromDate === toDate ? fromDate : `${fromDate} To ${toDate}`;
	const customerDisplay = selectedCustomer
		? `${selectedCustomer.code} : ${selectedCustomer.name}`
		: customerLabel?.trim() || "All Customers";
	const geographyDisplay = selectedCustomer?.geography?.trim() || "All";
	const paymentTermDisplay = selectedCustomer?.paymentTerm?.duration
		? `${selectedCustomer.paymentTerm.duration} days`
		: "All";
	const customerTypeDisplay = selectedCustomerTypeLabel?.trim() || "All";
	const customerTypeCountDisplay =
		typeof customerTypeCustomerCount === "number" ? String(customerTypeCustomerCount) : "All";

	return [
		{ key: "date", rows: [dateRange], align: "left", className: "md:col-span-3" },
		{ key: "branch", rows: ["Branch:", "[All]"], align: "left", className: "md:col-span-1" },
		{ key: "term", rows: ["Term:", `[${paymentTermDisplay}]`], align: "left", className: "md:col-span-1" },
		{ key: "geography", rows: ["Geography:", `[${geographyDisplay}]`], align: "left", className: "md:col-span-1" },
		{ key: "customer", rows: ["Customer:", `[${customerDisplay}]`], align: "left", className: "md:col-span-3" },
		{
			key: "customer-type",
			rows: ["Customer Type:", `[${customerTypeDisplay}]`],
			align: "left",
			className: "md:col-span-2",
		},
		{
			key: "customer-type-count",
			rows: ["Customer in group:", `[${customerTypeCountDisplay}]`],
			align: "left",
			className: "md:col-span-1",
		},
	];
}

function buildSaleDetailMetaColumns(
	selectedCustomer?: Customer,
	selectedCustomerLabel?: string,
): ReportTemplateMetaColumn[] {
	const customerDisplay = selectedCustomer
		? `${selectedCustomer.code} : ${selectedCustomer.name}`
		: selectedCustomerLabel?.trim() || "All";
	const geographyDisplay = selectedCustomer?.geography?.trim() || "All";
	const phoneDisplay = selectedCustomer?.telephone ? `[${selectedCustomer.telephone}]` : "[All]";

	return [
		{
			key: "branch",
			rows: ["Branch: [All]", "Warehouse: [All]", "Employee: [All]"],
			align: "left",
			className: "md:col-span-1",
		},
		{
			key: "category",
			rows: ["Category: [All]", "Type: [All]", "Promotion: [All]"],
			align: "left",
			className: "md:col-span-1",
		},
		{
			key: "customer",
			rows: [`Customer: [${customerDisplay}]`, `Geography: [${geographyDisplay}]`, `Phone: ${phoneDisplay}`],
			align: "left",
			className: "md:col-span-1",
		},
		{
			key: "brand",
			rows: ["Brand: [All]", "Rank: [All]"],
			align: "left",
			className: "md:col-span-1",
		},
	];
}

function buildSaleDetailSummary(rows: ReportTemplateRow[]): ReportTemplateSummaryRow[] {
	const totals = rows.reduce(
		(acc, row) => {
			const isDetailRow = row.cells.qty !== "" && row.cells.no === "";
			const isHeaderRow = row.cells.no !== "";

			if (isDetailRow) {
				acc.totalQty += parseNumericCell(row.cells.qty);
				acc.totalAmount += parseNumericCell(row.cells.amount);
				acc.cashInvoiceCount += 1;
			}

			if (isHeaderRow) {
				acc.totalCustomers += 1;
			}

			return acc;
		},
		{ totalQty: 0, totalAmount: 0, cashInvoiceCount: 0, totalCustomers: 0 },
	);

	return toSummaryRows([
		{ key: "sale-detail-total-qty", label: "Total Qty", value: formatNumber(totals.totalQty) },
		{ key: "sale-detail-total-amount", label: "Total Amount", value: formatNumber(totals.totalAmount) },
		{ key: "sale-detail-cash-invoice", label: "Cash + Invoice", value: formatNumber(totals.cashInvoiceCount) },
		{ key: "sale-detail-total-customer", label: "Total Customer", value: formatNumber(totals.totalCustomers) },
	]);
}

function buildCustomerLoanMetaColumns(): ReportTemplateMetaColumn[] {
	return [
		{ key: "title", rows: [REPORT_TITLES["customer-transaction"]], className: "md:col-span-1" },
		{ key: "term", rows: ["Payment term: Monthly Installments"], align: "center", className: "md:col-span-1" },
		{ key: "scope", rows: ["Borrower type: Customer"], align: "right", className: "md:col-span-1" },
	];
}

function buildEmployeeLoanMetaColumns(): ReportTemplateMetaColumn[] {
	return [
		{ key: "title", rows: [REPORT_TITLES["customer-transaction-detail-by-type"]], className: "md:col-span-1" },
		{ key: "term", rows: ["Payment term: Monthly Installments"], align: "center", className: "md:col-span-1" },
		{
			key: "scope",
			rows: [REPORT_TITLES["customer-transaction-detail-by-type"]],
			align: "right",
			className: "md:col-span-1",
		},
	];
}

function buildCompanyAssetMetaColumns(): ReportTemplateMetaColumn[] {
	return [
		{
			key: "scope",
			rows: [REPORT_TITLES["company-asset"], "Source: product catalog records"],
			className: "md:col-span-1",
		},
		{
			key: "supplier",
			rows: ["Supplier fields are derived from product reference only", "No supplier data in current source data"],
			align: "center",
			className: "md:col-span-1",
		},
		{
			key: "valuation",
			rows: ["Quantity reflects current inventory records", "Credit remains blank in current source data"],
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
		const itemCode = String(row.cells.itemCode ?? "").trim();
		const balanceName = String(row.cells.balanceName ?? "").trim();
		const itemKey = itemCode || balanceName;

		if (!itemKey) {
			console.warn("[sumLatestBalanceByItem] Skipping row without itemCode or balanceName:", row.key);
			continue;
		}

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
	dateText?: string,
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

function buildMonthlyPresentation({ filters }: ReportPresentationBuilderParams): ReportPresentation {
	const periodText = formatFilterRange(filters);

	return {
		headerContent: buildDefaultHeader(REPORT_TITLES["profit-and-loss"], periodText),
		showTableHeader: false,
		emptyText: "No monthly data available.",
	};
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

function buildCompanyAssetPresentation({ rows }: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation(REPORT_TITLES["company-asset"], undefined, {
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
	return buildSimplePresentation(REPORT_TITLES["inventory-valuation-summary"], formatFilterRange(filters), {
		summaryRows: buildSingleAmountSummary("inventory-balance", "Total balance qty", sumLatestBalanceByItem(rows)),
	});
}

function buildCustomerLoanPresentation({ filters, rows }: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation(REPORT_TITLES["customer-transaction"], formatFilterRange(filters), {
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

function buildSaleDetailPresentation({
	title,
	filters,
	selectedCustomer,
	selectedCustomerLabel,
	rows,
}: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation(title, formatFilterRange(filters), {
		metaColumns: buildSaleDetailMetaColumns(selectedCustomer, selectedCustomerLabel),
		summaryRows: buildSaleDetailSummary(rows),
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

	const shouldShowDate =
		!!params.filterConfig &&
		(!!params.filterConfig.dateRange || !!params.filterConfig.singleDate || !!params.filterConfig.monthOnly);

	return buildSimplePresentation(params.title, shouldShowDate ? formatFilterRange(params.filters) : undefined);
}
