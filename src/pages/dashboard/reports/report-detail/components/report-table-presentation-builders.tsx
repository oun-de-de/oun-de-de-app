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
	return [
		{
			key: "currency",
			rows: ["Currency: KHR"],
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
	// Match on row keys, not cell shape: the per-customer TOTAL row also carries a qty and a blank no.
	const totals = rows.reduce(
		(acc, row) => {
			if (row.key.startsWith("sale-")) {
				acc.totalQty += parseNumericCell(row.cells.qty);
				acc.totalAmount += parseNumericCell(row.cells.amount);
				acc.cashInvoiceCount += 1;
			}

			if (row.key.startsWith("customer-group-") && !row.key.endsWith("-total")) {
				acc.totalCustomers += 1;
			}

			return acc;
		},
		{ totalQty: 0, totalAmount: 0, cashInvoiceCount: 0, totalCustomers: 0 },
	);

	return toSummaryRows([
		{
			key: "sale-detail-total-qty",
			label: "Total Qty",
			value: formatNumber(totals.totalQty),
		},
		{
			key: "sale-detail-total-amount",
			label: "Total Amount",
			value: formatNumber(totals.totalAmount),
		},
		{
			key: "sale-detail-cash-invoice",
			label: "Cash + Invoice",
			value: formatNumber(totals.cashInvoiceCount),
		},
		{
			key: "sale-detail-total-customer",
			label: "Total Customer",
			value: formatNumber(totals.totalCustomers),
		},
	]);
}

function buildCustomerLoanMetaColumns(): ReportTemplateMetaColumn[] {
	return [
		{
			key: "title",
			rows: [REPORT_TITLES["customer-transaction"]],
			className: "md:col-span-1",
		},
		{
			key: "term",
			rows: ["Payment term: Monthly Installments"],
			align: "center",
			className: "md:col-span-1",
		},
		{
			key: "scope",
			rows: ["Borrower type: Customer"],
			align: "right",
			className: "md:col-span-1",
		},
	];
}

function buildEmployeeLoanMetaColumns(): ReportTemplateMetaColumn[] {
	return [
		{
			key: "title",
			rows: ["Employee Loan Ledger"],
			className: "md:col-span-1",
		},
		{
			key: "term",
			rows: ["Payment term: Monthly Installments"],
			align: "center",
			className: "md:col-span-1",
		},
		{
			key: "scope",
			rows: ["Borrower type: Employee"],
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
	return items.map((item) => ({
		key: item.key,
		label: item.label,
		value: item.value,
	}));
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
		{
			key: `${prefix}-debit`,
			label: "Total debit",
			value: formatNumber(sumCell(rows, "debit")),
		},
		{
			key: `${prefix}-credit`,
			label: "Total credit",
			value: formatNumber(sumCell(rows, "credit")),
		},
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
			{
				key: "loan-debit",
				label: "Total principal",
				value: formatNumber(sumCell(rows, "debit")),
			},
			{
				key: "loan-credit",
				label: "Total collected",
				value: formatNumber(sumCell(rows, "credit")),
			},
			{
				key: "loan-balance",
				label: "Outstanding balance",
				value: formatNumber(sumCell(rows, "balance")),
			},
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

function buildOpenInvoiceHeader(title: string, dateText?: string) {
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
					<div className="text-[20px] font-bold">{REPORT_KHMER_TITLE}</div>
					<div className="mt-1 text-[16px] font-bold tracking-wide underline">{title.toUpperCase()}</div>
					{dateText && <div className="mt-1 text-[13px] font-semibold text-slate-600">{dateText}</div>}
				</div>
				<div className="w-20" />
			</div>
		</div>
	);
}

function buildOpenInvoiceMetaColumns(
	_filters?: ReportFiltersValue,
	selectedCustomerLabel?: string,
	selectedCustomer?: Customer,
): ReportTemplateMetaColumn[] {
	const customerDisplay = selectedCustomer
		? `${selectedCustomer.code ? `${selectedCustomer.code} : ` : ""}${selectedCustomer.name}`
		: selectedCustomerLabel && selectedCustomerLabel !== "All Customers"
			? selectedCustomerLabel
			: "All";

	return [
		{
			key: "open-inv-meta-left",
			rows: ["Branch: ['01 : ភ្នំពេញ']", `Customer: [${customerDisplay}]`],
			align: "left",
			className: "md:col-span-1",
		},
		{
			key: "open-inv-meta-center",
			rows: ["Term: [All]", "Category: [All]"],
			align: "center",
			className: "md:col-span-1",
		},
		{
			key: "open-inv-meta-right",
			rows: ["Geography: [All]", "Employee: [All]"],
			align: "right",
			className: "md:col-span-1",
		},
	];
}

function buildOpenInvoiceSummary(rows: ReportTemplateRow[]): ReportTemplateSummaryRow[] {
	const totalCustomer = rows.filter((row) => row.key.startsWith("open-inv-customer-header-")).length;
	const totalBalance = rows
		.filter((row) => row.key.startsWith("open-inv-customer-subtotal-"))
		.reduce((sum, row) => sum + parseNumericCell(row.cells.balance), 0);

	return toSummaryRows([
		{ key: "open-inv-total-customer", label: "Total Customer", value: formatNumber(totalCustomer) },
		{ key: "open-inv-total-balance", label: "Total Balance", value: formatNumber(totalBalance) },
	]);
}

function buildOpenInvoicePresentation(params: ReportPresentationBuilderParams): ReportPresentation {
	const { title, filters, selectedCustomerLabel, selectedCustomer, rows } = params;
	const dateText = formatFilterDateForDisplay(filters?.fromDate);

	return {
		headerContent: buildOpenInvoiceHeader(title, dateText),
		metaColumns: buildOpenInvoiceMetaColumns(filters, selectedCustomerLabel, selectedCustomer),
		summaryRows: buildOpenInvoiceSummary(rows),
		showTableHeader: true,
	};
}

function buildCashTransactionHeader(title: string, dateText?: string) {
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
					<div className="text-[20px] font-bold">{REPORT_KHMER_TITLE}</div>
					<div className="text-[13px] font-medium text-slate-700">ភ្នំពេញ</div>
					<div className="text-[13px] font-medium text-slate-700">070669863</div>
					<div className="mt-2 text-[16px] font-bold tracking-wide">{title.toUpperCase()}</div>
					{dateText && <div className="mt-1 text-[13px] font-semibold text-slate-600">{dateText}</div>}
				</div>
				<div className="w-20" />
			</div>
		</div>
	);
}

function buildCashTransactionMetaColumns(): ReportTemplateMetaColumn[] {
	return [
		{
			key: "branch-journal",
			rows: ["Branch: ['ភ្នំពេញ']", "Journal type: ['All']"],
			align: "left",
			className: "md:col-span-1",
		},
		{
			key: "chart-of-account",
			rows: ["Chart of account: ['All']"],
			align: "center",
			className: "md:col-span-2",
		},
		{
			key: "currency",
			rows: ["Currency: KHR"],
			align: "right",
			className: "md:col-span-1",
		},
	];
}

function buildCashTransactionPresentation({ filters }: ReportPresentationBuilderParams): ReportPresentation {
	const dateRange = formatFilterRange(filters);

	return {
		headerContent: buildCashTransactionHeader("CASH TRANSACTION", dateRange),
		metaColumns: buildCashTransactionMetaColumns(),
		showTableHeader: true,
	};
}

function buildReceiptDetailPresentation({
	title,
	filters,
	selectedCustomer,
	selectedCustomerLabel,
}: ReportPresentationBuilderParams): ReportPresentation {
	return buildSimplePresentation(title, formatFilterRange(filters), {
		metaColumns: buildSaleDetailMetaColumns(selectedCustomer, selectedCustomerLabel),
		showTableHeader: true,
	});
}

function buildCustomerTransactionDetailByTypeMetaColumns(
	selectedCustomer?: Customer,
	selectedCustomerLabel?: string,
): ReportTemplateMetaColumn[] {
	const customerDisplay = selectedCustomer
		? `${selectedCustomer.code ? `${selectedCustomer.code} : ` : ""}${selectedCustomer.name}`
		: selectedCustomerLabel && selectedCustomerLabel !== "All Customers"
			? selectedCustomerLabel
			: "All";

	return [
		{
			key: "tx-meta-left",
			rows: ["Branch: ['01 : ភ្នំពេញ']", "Geography: [All]"],
			align: "left",
			className: "md:col-span-1",
		},
		{
			key: "tx-meta-center",
			rows: ["Customer Type: [All]", `Customer: [${customerDisplay}]`],
			align: "center",
			className: "md:col-span-1",
		},
		{
			key: "tx-meta-right",
			rows: ["Category: [All]", "Item: [All]"],
			align: "right",
			className: "md:col-span-1",
		},
	];
}

function buildCustomerTransactionDetailByTypePresentation(params: ReportPresentationBuilderParams): ReportPresentation {
	const { title, filters, selectedCustomer, selectedCustomerLabel, rows } = params;
	const dateRange = formatFilterRange(filters);

	let totalQty = 0;
	let totalInvoice = 0;
	let totalReceive = 0;

	for (const row of rows) {
		if (row.key.startsWith("tx-inv-row-")) {
			totalQty += parseNumericCell(row.cells.qty);
			totalInvoice += parseNumericCell(row.cells.total);
		} else if (row.key.startsWith("tx-rcp-row-")) {
			totalReceive += parseNumericCell(row.cells.total);
		}
	}

	const totalAmount = totalInvoice - totalReceive;

	return {
		headerContent: buildOpenInvoiceHeader(title, dateRange),
		metaColumns: buildCustomerTransactionDetailByTypeMetaColumns(selectedCustomer, selectedCustomerLabel),
		summaryRows: [
			{ key: "sum-qty", label: "Total Qty", value: formatNumber(totalQty) },
			{ key: "sum-cash", label: "Total Cash", value: "-" },
			{
				key: "sum-invoice",
				label: "Total Invoice",
				value: `${formatNumber(totalInvoice)}`,
			},
			{
				key: "sum-receive",
				label: "Total Receive",
				value: `${formatNumber(totalReceive)}`,
			},
			{
				key: "sum-amount",
				label: "Total Amount",
				value: `${formatNumber(totalAmount)}`,
			},
		],
		showTableHeader: true,
	};
}

function buildCycleSummary(rows: ReportTemplateRow[]): ReportTemplateSummaryRow[] {
	let totalInvoice = 0;
	let totalPaid = 0;
	let totalOutstanding = 0;

	for (const row of rows) {
		if (row.key === "cycle-grand-total") continue;
		totalInvoice += parseNumericCell(row.cells.invoiceTotal);
		totalPaid += parseNumericCell(row.cells.paid);
		totalOutstanding += parseNumericCell(row.cells.outstanding);
	}

	return toSummaryRows([
		{ key: "cycle-total-invoice", label: "Total Invoice", value: formatNumber(totalInvoice) },
		{ key: "cycle-total-paid", label: "Total Paid", value: formatNumber(totalPaid) },
		{ key: "cycle-total-balance", label: "Total Balance", value: formatNumber(totalOutstanding) },
	]);
}

function buildCyclePresentation(params: ReportPresentationBuilderParams): ReportPresentation {
	const { title, filters, selectedCustomerLabel, selectedCustomer, rows } = params;
	const dateRange = formatFilterRange(filters);

	return {
		headerContent: buildOpenInvoiceHeader(title, dateRange),
		metaColumns: buildOpenInvoiceMetaColumns(filters, selectedCustomerLabel, selectedCustomer),
		summaryRows: buildCycleSummary(rows),
		showTableHeader: true,
	};
}

const PRESENTATION_BUILDERS: Partial<
	Record<ReportTemplateId, (params: ReportPresentationBuilderParams) => ReportPresentation>
> = {
	"cash-transaction-report": buildCashTransactionPresentation,
	"monthly-revenue-expense-summary": buildMonthlyPresentation,
	"daily-report-summary": buildDailyPresentation,
	"company-asset-register": buildCompanyAssetPresentation,
	"income-expense-ledger": buildLedgerPresentation,
	"ice-bag-inventory-stock-report": buildInventoryPresentation,
	"customer-loan-register": buildCustomerLoanPresentation,
	"employee-loan-ledger": buildEmployeeLoanPresentation,
	"sale-detail-by-customer": buildSaleDetailPresentation,
	"receipt-detail-by-customer": buildReceiptDetailPresentation,
	"customer-transaction-detail-by-type": buildCustomerTransactionDetailByTypePresentation,
	"open-invoice-detail-by-customer": buildOpenInvoicePresentation,
	"cycle-summary": buildCyclePresentation,
};

export function buildReportPresentation(params: ReportPresentationBuilderParams): ReportPresentation {
	const builder = PRESENTATION_BUILDERS[params.templateId];
	if (builder) return builder(params);

	const shouldShowDate =
		!!params.filterConfig &&
		(!!params.filterConfig.dateRange || !!params.filterConfig.singleDate || !!params.filterConfig.monthOnly);

	return buildSimplePresentation(params.title, shouldShowDate ? formatFilterRange(params.filters) : undefined);
}
