import type { BorrowerType } from "@/core/types/loan";
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
	/** Determines which data-fetching branch to use in ReportTable */
	dataSource?:
		| "invoice-export"
		| "cycle"
		| "customer-list"
		| "product-list"
		| "loan-list"
		| "accounting-mock"
		| "invoice-summary"
		| "asset-list"
		| "unsupported";
	invoiceType?: "invoice" | "receipt";
	loanBorrowerType?: BorrowerType;
	emptyText?: string;
}

function createTextColumn(
	id: string,
	header: string,
	align: "left" | "right" | "center" = "left",
): ReportTemplateColumn {
	return {
		id,
		header,
		cell: ({ row }) => row.original.cells[id],
		meta: { align },
	};
}

function buildColumnMeta(className: string, align?: "left" | "center" | "right") {
	return { align, className, headerClassName: className };
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

// ─── Cycle report columns ──────────────────────────────────────

function buildCycleColumns(): ReportTemplateColumn[] {
	return [
		createTextColumn("customer", "Customer"),
		createTextColumn("cycle", "Cycle"),
		createTextColumn("openingBalance", "Opening Balance"),
		createTextColumn("invoiceTotal", "Invoice Total"),
		createTextColumn("paid", "Paid"),
	];
}

function buildCustomerListColumns(): ReportTemplateColumn[] {
	return [
		{ id: "no", header: "NO", cell: ({ row }) => row.original.cells.no, meta: buildColumnMeta("w-[5%]", "center") },
		{
			id: "name",
			header: "NAME",
			cell: ({ row }) => row.original.cells.name,
			meta: buildColumnMeta("w-[20%]", "left"),
		},
		{
			id: "code",
			header: "CODE",
			cell: ({ row }) => row.original.cells.code,
			meta: buildColumnMeta("w-[10%]", "center"),
		},
		{
			id: "phone",
			header: "PHONE",
			cell: ({ row }) => row.original.cells.phone,
			meta: buildColumnMeta("w-[15%]", "left"),
		},
		{
			id: "geography",
			header: "GEOGRAPHY",
			cell: ({ row }) => row.original.cells.geography,
			meta: buildColumnMeta("w-[15%]", "left"),
		},
		{
			id: "address",
			header: "ADDRESS",
			cell: ({ row }) => row.original.cells.address,
			meta: buildColumnMeta("w-[35%]", "left"),
		},
	];
}

function buildCustomerLoanColumns(): ReportTemplateColumn[] {
	return [
		{ id: "no", header: "NO.", cell: ({ row }) => row.original.cells.no, meta: buildColumnMeta("w-[6%]", "center") },
		{
			id: "date",
			header: "DATE",
			cell: ({ row }) => row.original.cells.date,
			meta: buildColumnMeta("w-[11%]", "center"),
		},
		{
			id: "code",
			header: "CUSTOMER CODE",
			cell: ({ row }) => row.original.cells.code,
			meta: buildColumnMeta("w-[12%]", "center"),
		},
		{
			id: "name",
			header: "CUSTOMERS' NAME",
			cell: ({ row }) => row.original.cells.name,
			meta: buildColumnMeta("w-[16%]", "left"),
		},
		{
			id: "reason",
			header: "REASON",
			cell: ({ row }) => row.original.cells.reason,
			meta: buildColumnMeta("w-[18%]", "left"),
		},
		{
			id: "debit",
			header: "DEBIT",
			cell: ({ row }) => row.original.cells.debit,
			meta: buildColumnMeta("w-[10%]", "right"),
		},
		{
			id: "credit",
			header: "CREDIT",
			cell: ({ row }) => row.original.cells.credit,
			meta: buildColumnMeta("w-[10%]", "right"),
		},
		{
			id: "balance",
			header: "BALANCE",
			cell: ({ row }) => row.original.cells.balance,
			meta: buildColumnMeta("w-[10%]", "right"),
		},
		{
			id: "qty",
			header: "QTY",
			cell: ({ row }) => row.original.cells.qty,
			meta: buildColumnMeta("w-[7%]", "right"),
		},
		{
			id: "paymentTerm",
			header: "PAYMENT TERM",
			cell: ({ row }) => row.original.cells.paymentTerm,
			meta: buildColumnMeta("w-[12%]", "left"),
		},
		{
			id: "other",
			header: "OTHER",
			cell: ({ row }) => row.original.cells.other,
			meta: buildColumnMeta("w-[10%]", "left"),
		},
	];
}

function buildEmployeeLoanColumns(): ReportTemplateColumn[] {
	return [
		{
			id: "date",
			header: "DATE",
			cell: ({ row }) => row.original.cells.date,
			meta: buildColumnMeta("w-[12%]", "center"),
		},
		{
			id: "type",
			header: "TYPE",
			cell: ({ row }) => row.original.cells.type,
			meta: buildColumnMeta("w-[12%]", "center"),
		},
		{
			id: "refNo",
			header: "REF NO",
			cell: ({ row }) => row.original.cells.refNo,
			meta: buildColumnMeta("w-[14%]", "left"),
		},
		{
			id: "employee",
			header: "EMPLOYEE",
			cell: ({ row }) => row.original.cells.employee,
			meta: buildColumnMeta("w-[18%]", "left"),
		},
		{
			id: "memo",
			header: "MEMO",
			cell: ({ row }) => row.original.cells.memo,
			meta: buildColumnMeta("w-[22%]", "left"),
		},
		{
			id: "name",
			header: "NAME",
			cell: ({ row }) => row.original.cells.name,
			meta: buildColumnMeta("w-[12%]", "left"),
		},
		{
			id: "debit",
			header: "DEBIT",
			cell: ({ row }) => row.original.cells.debit,
			meta: buildColumnMeta("w-[10%]", "right"),
		},
		{
			id: "credit",
			header: "CREDIT",
			cell: ({ row }) => row.original.cells.credit,
			meta: buildColumnMeta("w-[10%]", "right"),
		},
		{
			id: "balance",
			header: "BALANCE",
			cell: ({ row }) => row.original.cells.balance,
			meta: buildColumnMeta("w-[10%]", "right"),
		},
	];
}

function buildSaleDetailColumns(): ReportTemplateColumn[] {
	return [
		{ id: "no", header: "NO", cell: ({ row }) => row.original.cells.no, meta: buildColumnMeta("w-[5%]", "center") },
		{
			id: "date",
			header: "DATE",
			cell: ({ row }) => row.original.cells.date,
			meta: buildColumnMeta("w-[12%]", "center"),
		},
		{
			id: "refNo",
			header: "REF NO",
			cell: ({ row }) => row.original.cells.refNo,
			meta: buildColumnMeta("w-[16%]", "left"),
		},
		{
			id: "type",
			header: "TYPE",
			cell: ({ row }) => row.original.cells.type,
			meta: buildColumnMeta("w-[12%]", "center"),
		},
		{
			id: "category",
			header: "CATEGORY",
			cell: ({ row }) => row.original.cells.category,
			meta: buildColumnMeta("w-[16%]", "left"),
		},
		{
			id: "item",
			header: "ITEM",
			cell: ({ row }) => row.original.cells.item,
			meta: buildColumnMeta("w-[15%]", "left"),
		},
		{
			id: "qty",
			header: "QTY",
			cell: ({ row }) => row.original.cells.qty,
			meta: buildColumnMeta("w-[8%]", "right"),
		},
		{
			id: "price",
			header: "PRICE",
			cell: ({ row }) => row.original.cells.price,
			meta: buildColumnMeta("w-[8%]", "right"),
		},
		{
			id: "amount",
			header: "AMOUNT",
			cell: ({ row }) => row.original.cells.amount,
			meta: buildColumnMeta("w-[12%]", "right"),
		},
	];
}

// ─── Product list columns ──────────────────────────────────────

function buildProductListColumns(): ReportTemplateColumn[] {
	return [
		{ id: "no", header: "NO", cell: ({ row }) => row.original.cells.no, meta: buildColumnMeta("w-[5%]", "center") },
		{
			id: "name",
			header: "PRODUCT NAME",
			cell: ({ row }) => row.original.cells.name,
			meta: buildColumnMeta("w-[30%]", "left"),
		},
		{
			id: "unit",
			header: "UNIT",
			cell: ({ row }) => row.original.cells.unit,
			meta: buildColumnMeta("w-[10%]", "center"),
		},
		{
			id: "quantity",
			header: "QTY",
			cell: ({ row }) => row.original.cells.quantity,
			meta: buildColumnMeta("w-[10%]", "right"),
		},
		{
			id: "cost",
			header: "COST",
			cell: ({ row }) => row.original.cells.cost,
			meta: buildColumnMeta("w-[15%]", "right"),
		},
		{
			id: "price",
			header: "PRICE",
			cell: ({ row }) => row.original.cells.price,
			meta: buildColumnMeta("w-[15%]", "right"),
		},
	];
}

function buildInventoryStockColumns(): ReportTemplateColumn[] {
	return [
		{ id: "no", header: "NO", cell: ({ row }) => row.original.cells.no, meta: buildColumnMeta("w-[5%]", "center") },
		{
			id: "name",
			header: "PRODUCT NAME",
			cell: ({ row }) => row.original.cells.name,
			meta: buildColumnMeta("w-[30%]", "left"),
		},
		{
			id: "unit",
			header: "UNIT",
			cell: ({ row }) => row.original.cells.unit,
			meta: buildColumnMeta("w-[10%]", "center"),
		},
		{
			id: "quantity",
			header: "ON HAND",
			cell: ({ row }) => row.original.cells.quantity,
			meta: buildColumnMeta("w-[15%]", "right"),
		},
		{
			id: "cost",
			header: "AVG COST",
			cell: ({ row }) => row.original.cells.cost,
			meta: buildColumnMeta("w-[15%]", "right"),
		},
		{
			id: "value",
			header: "ASSET VALUE",
			cell: ({ row }) => row.original.cells.value,
			meta: buildColumnMeta("w-[15%]", "right"),
		},
	];
}

// ─── Accounting columns ────────────────────────────────────────

function buildLedgerColumns(): ReportTemplateColumn[] {
	return [
		{ id: "no", header: "NO", cell: ({ row }) => row.original.cells.no, meta: buildColumnMeta("w-[5%]", "center") },
		{
			id: "date",
			header: "DATE",
			cell: ({ row }) => row.original.cells.date,
			meta: buildColumnMeta("w-[10%]", "center"),
		},
		{
			id: "refNo",
			header: "REF NO",
			cell: ({ row }) => row.original.cells.refNo,
			meta: buildColumnMeta("w-[12%]", "left"),
		},
		{
			id: "account",
			header: "ACCOUNT",
			cell: ({ row }) => row.original.cells.account,
			meta: buildColumnMeta("w-[18%]", "left"),
		},
		{
			id: "memo",
			header: "MEMO",
			cell: ({ row }) => row.original.cells.memo,
			meta: buildColumnMeta("w-[20%]", "left"),
		},
		{
			id: "debit",
			header: "DEBIT",
			cell: ({ row }) => row.original.cells.debit,
			meta: buildColumnMeta("w-[12%]", "right"),
		},
		{
			id: "credit",
			header: "CREDIT",
			cell: ({ row }) => row.original.cells.credit,
			meta: buildColumnMeta("w-[12%]", "right"),
		},
	];
}

function buildTrialBalanceColumns(): ReportTemplateColumn[] {
	return [
		{ id: "no", header: "NO", cell: ({ row }) => row.original.cells.no, meta: buildColumnMeta("w-[5%]", "center") },
		{
			id: "account",
			header: "ACCOUNT",
			cell: ({ row }) => row.original.cells.account,
			meta: buildColumnMeta("w-[40%]", "left"),
		},
		{
			id: "debit",
			header: "DEBIT",
			cell: ({ row }) => row.original.cells.debit,
			meta: buildColumnMeta("w-[25%]", "right"),
		},
		{
			id: "credit",
			header: "CREDIT",
			cell: ({ row }) => row.original.cells.credit,
			meta: buildColumnMeta("w-[25%]", "right"),
		},
	];
}

function buildMonthlySummaryColumns(): ReportTemplateColumn[] {
	return [
		{
			id: "label",
			header: "DESCRIPTION",
			cell: ({ row }) => row.original.cells.label,
			meta: buildColumnMeta("w-[36%]", "left"),
		},
		{
			id: "detail",
			header: "DETAIL",
			cell: ({ row }) => row.original.cells.detail,
			meta: buildColumnMeta("w-[40%]", "left"),
		},
		{
			id: "amount",
			header: "AMOUNT",
			cell: ({ row }) => row.original.cells.amount,
			meta: buildColumnMeta("w-[24%]", "right"),
		},
	];
}

function buildCompanyAssetColumns(): ReportTemplateColumn[] {
	return [
		{ id: "no", header: "NO.", cell: ({ row }) => row.original.cells.no, meta: buildColumnMeta("w-[5%]", "center") },
		{
			id: "name",
			header: "ITEMS' NAME",
			cell: ({ row }) => row.original.cells.name,
			meta: buildColumnMeta("w-[18%]", "left"),
		},
		{
			id: "entryDate",
			header: "ENTRY DATE",
			cell: ({ row }) => row.original.cells.entryDate,
			meta: buildColumnMeta("w-[12%]", "center"),
		},
		{
			id: "supplierName",
			header: "SUPPLIER",
			cell: ({ row }) => row.original.cells.supplierName,
			meta: buildColumnMeta("w-[12%]", "left"),
		},
		{
			id: "supplierPhone",
			header: "PHONE",
			cell: ({ row }) => row.original.cells.supplierPhone,
			meta: buildColumnMeta("w-[10%]", "left"),
		},
		{
			id: "supplierAddress",
			header: "ADDRESS",
			cell: ({ row }) => row.original.cells.supplierAddress,
			meta: buildColumnMeta("w-[12%]", "left"),
		},
		{
			id: "detail",
			header: "DETAIL",
			cell: ({ row }) => row.original.cells.detail,
			meta: buildColumnMeta("w-[20%]", "left"),
		},
		{
			id: "debit",
			header: "DEBIT",
			cell: ({ row }) => row.original.cells.debit,
			meta: buildColumnMeta("w-[8%]", "right"),
		},
		{
			id: "credit",
			header: "CREDIT",
			cell: ({ row }) => row.original.cells.credit,
			meta: buildColumnMeta("w-[8%]", "right"),
		},
		{
			id: "balance",
			header: "BALANCE",
			cell: ({ row }) => row.original.cells.balance,
			meta: buildColumnMeta("w-[8%]", "right"),
		},
		{
			id: "qty",
			header: "QTY",
			cell: ({ row }) => row.original.cells.qty,
			meta: buildColumnMeta("w-[7%]", "right"),
		},
		{
			id: "other",
			header: "OTHER",
			cell: ({ row }) => row.original.cells.other,
			meta: buildColumnMeta("w-[10%]", "left"),
		},
	];
}

// ─── Report Registry ───────────────────────────────────────────

export const REPORT_REGISTRY: Record<string, ReportDefinition> = {
	// ── Invoice-based reports ──────────────────────────────────
	"open-invoice-detail-by-customer": {
		slug: "open-invoice-detail-by-customer",
		title: "Open Invoice Detail Report",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: () => EXPORT_PREVIEW_COLUMNS,
		columnLabels: INVOICE_REPORT_COLUMN_LABELS,
		hiddenColumnKeys: buildInvoiceHiddenColumnKeys,
		dataSource: "invoice-export",
	},
	"sale-detail-by-customer": {
		slug: "sale-detail-by-customer",
		title: "Sale Detail By Customer",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildSaleDetailColumns,
		dataSource: "invoice-export",
		invoiceType: "invoice",
	},

	// ── Receipt-based reports ──────────────────────────────────
	"receipt-detail-by-customer": {
		slug: "receipt-detail-by-customer",
		title: "Receipt Detail By Customer",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: () => EXPORT_PREVIEW_COLUMNS,
		columnLabels: INVOICE_REPORT_COLUMN_LABELS,
		hiddenColumnKeys: buildInvoiceHiddenColumnKeys,
		dataSource: "invoice-export",
		invoiceType: "receipt",
	},

	// ── Cycle-based reports ────────────────────────────────────
	"open-invoice-on-period-by-group": {
		slug: "open-invoice-on-period-by-group",
		title: "Open Invoice By Period Group",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCycleColumns,
		dataSource: "cycle",
	},

	// ── Customer-list reports ──────────────────────────────────
	"customer-list": {
		slug: "customer-list",
		title: "Customer List",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCustomerListColumns,
		dataSource: "customer-list",
	},

	// ── Customer-transaction reports (invoice data per customer) ─
	"customer-transaction": {
		slug: "customer-transaction",
		title: "Customer Loan Register",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCustomerLoanColumns,
		dataSource: "loan-list",
		loanBorrowerType: "customer",
	},
	"customer-transaction-detail-by-type": {
		slug: "customer-transaction-detail-by-type",
		title: "Employee Loan Ledger",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildEmployeeLoanColumns,
		dataSource: "loan-list",
		loanBorrowerType: "employee",
	},

	// ── Inventory reports ────────────────────────────────
	"inventory-valuation-summary": {
		slug: "inventory-valuation-summary",
		title: "Inventory Valuation Summary",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildInventoryStockColumns,
		dataSource: "product-list",
	},
	"product-list": {
		slug: "product-list",
		title: "Product List",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildProductListColumns,
		dataSource: "product-list",
	},

	// ── Accounting reports ──────────────────────────────
	"general-ledger": {
		slug: "general-ledger",
		title: "General Ledger",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildLedgerColumns,
		dataSource: "accounting-mock",
	},
	"trial-balance": {
		slug: "trial-balance",
		title: "Trial Balance",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildTrialBalanceColumns,
		dataSource: "accounting-mock",
	},
	"profit-and-loss": {
		slug: "profit-and-loss",
		title: "Monthly Revenue & Expense",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildMonthlySummaryColumns,
		dataSource: "invoice-summary",
	},
	"balance-sheet": {
		slug: "balance-sheet",
		title: "Income & Expense Ledger",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildLedgerColumns,
		dataSource: "accounting-mock",
	},
	"daily-report": {
		slug: "daily-report",
		title: "Daily Report",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildMonthlySummaryColumns,
		dataSource: "invoice-summary",
	},
	"company-asset": {
		slug: "company-asset",
		title: "Company Asset Register",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCompanyAssetColumns,
		dataSource: "asset-list",
	},
};

export const DEFAULT_REPORT_SLUG = "open-invoice-detail-by-customer";

export function hasReportDefinition(slug?: string): slug is string {
	return !!slug && slug in REPORT_REGISTRY;
}

export function getReportDefinition(slug?: string): ReportDefinition {
	if (hasReportDefinition(slug)) {
		return REPORT_REGISTRY[slug];
	}
	return REPORT_REGISTRY[DEFAULT_REPORT_SLUG];
}
