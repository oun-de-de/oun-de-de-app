import { accountingRows } from "@/_mock/data/dashboard";
import type { Invoice, InvoiceExportPreviewRow } from "@/core/types/invoice";
import type { MonthlyReportResponse } from "@/core/types/report";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { parseNumericCell } from "../report-table-utils";
import {
	splitPreviewRowsIntoCashAndCredit,
	sumOriginalAmount,
	sumPreviewRowPaidAmount,
} from "./invoice-builder-helpers";
import { createReportRow } from "./report-row-helpers";

function sumExpenses(): number {
	return accountingRows.reduce((sum, row) => {
		const debit = Number.parseFloat(String(row.dr ?? "").replaceAll(",", ""));
		return sum + (Number.isFinite(debit) ? debit : 0);
	}, 0);
}

function toSummaryRow(key: string, label: string, detail: string, amount: number): ReportTemplateRow {
	return createReportRow(key, {
		label,
		detail,
		amount: `${formatNumber(amount)} Riel`,
	});
}

function toMonthlySummarySectionRow(key: string, label: string, amount: number): ReportTemplateRow {
	return createReportRow(key, {
		label,
		detail: "",
		amount: `${formatNumber(amount)} Riel`,
	});
}

export function buildMonthlyRevenueExpenseRows(
	invoices: Invoice[],
	previewRows: InvoiceExportPreviewRow[],
): ReportTemplateRow[] {
	const { cashRows, creditRows } = splitPreviewRowsIntoCashAndCredit(invoices, previewRows);
	const installmentCollected = creditRows.filter((row) => (row.paid ?? 0) > 0);
	const totalMonthlyIncome = sumOriginalAmount(previewRows);
	const totalCashSales = sumOriginalAmount(cashRows) + sumPreviewRowPaidAmount(creditRows);
	const totalCreditSales = sumOriginalAmount(creditRows);
	const totalInstallments = sumPreviewRowPaidAmount(installmentCollected);
	const totalExpenses = sumExpenses();
	const netTotal = totalMonthlyIncome - totalExpenses - totalCreditSales;
	const expenseDetailRows = accountingRows
		.filter((row) => parseNumericCell(row.dr) > 0)
		.map((row, index) =>
			toSummaryRow(
				`monthly-expense-detail-${index}`,
				row.memo || row.type || `Expense ${index + 1}`,
				row.refNo || "Accounting ledger debit entry",
				parseNumericCell(row.dr),
			),
		);

	return [
		toMonthlySummarySectionRow("monthly-income-total", "Total monthly income", totalMonthlyIncome),
		toSummaryRow(
			"monthly-cash-sales",
			"1- Ice sales cash and debt collections",
			"Receipt rows plus payments collected on credit invoices",
			totalCashSales,
		),
		toSummaryRow(
			"monthly-credit-sales",
			"2- Customer credit sales",
			"Invoice rows in selected period",
			totalCreditSales,
		),
		toSummaryRow(
			"monthly-installments",
			"3- Customer installments",
			"Collected payments recorded on credit invoices",
			totalInstallments,
		),
		toMonthlySummarySectionRow("monthly-expense-total", "Total monthly expenses", totalExpenses),
		...expenseDetailRows,
		toSummaryRow("monthly-net", "Monthly cash rolling", "Total income - total expenses - credit sales", netTotal),
	];
}

export function buildMonthlyRevenueExpenseApiRows(monthlyReport?: MonthlyReportResponse): ReportTemplateRow[] {
	if (!monthlyReport) return [];

	const expenses = monthlyReport.expenses ?? [];
	const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount ?? 0), 0);
	const netTotal =
		(monthlyReport.saleInvoice ?? 0) +
		(monthlyReport.cashInstallment ?? 0) -
		totalExpenses -
		(monthlyReport.accountsReceivable ?? 0);
	const expenseDetailRows = expenses.map((item, index) =>
		toSummaryRow(
			`monthly-expense-api-${index}`,
			item.description || `Expense ${index + 1}`,
			"Monthly report expense line",
			item.amount ?? 0,
		),
	);

	return [
		toMonthlySummarySectionRow(
			"monthly-income-total-api",
			"Total monthly income",
			(monthlyReport.saleInvoice ?? 0) + (monthlyReport.cashInstallment ?? 0),
		),
		toSummaryRow(
			"monthly-accounts-receivable-api",
			"1- Accounts receivable",
			"Outstanding receivable balance in selected period",
			monthlyReport.accountsReceivable ?? 0,
		),
		toSummaryRow(
			"monthly-sale-invoice-api",
			"2- Sale invoice",
			"Total sale invoice amount in selected period",
			monthlyReport.saleInvoice ?? 0,
		),
		toSummaryRow(
			"monthly-cash-installment-api",
			"3- Cash installment",
			"Collected cash installments in selected period",
			monthlyReport.cashInstallment ?? 0,
		),
		toMonthlySummarySectionRow("monthly-expense-total-api", "Total monthly expenses", totalExpenses),
		...expenseDetailRows,
		toSummaryRow(
			"monthly-net-api",
			"Monthly cash rolling",
			"Sale invoice + cash installment - expenses - accounts receivable",
			netTotal,
		),
	];
}
