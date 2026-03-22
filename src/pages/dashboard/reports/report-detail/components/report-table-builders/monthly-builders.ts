import type { MonthlyReportResponse } from "@/core/types/report";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";

function toIndentedSummaryRow(key: string, label: string, detail: string, amount: number): ReportTemplateRow {
	return {
		key,
		cells: {
			label,
			detail,
			amount: `${formatNumber(amount)} Riel`,
		},
		cellClassNames: {
			label: "pl-6",
		},
	};
}

function toMonthlySummarySectionRow(key: string, label: string, amount: number): ReportTemplateRow {
	return {
		key,
		cells: {
			label,
			detail: "",
			amount: `${formatNumber(amount)} Riel`,
		},
		rowClassName: "font-semibold",
		cellClassNames: {
			label: "font-semibold",
			detail: "font-semibold",
			amount: "font-semibold",
		},
	};
}

function toMonthlyNetRow(key: string, amount: number): ReportTemplateRow {
	return {
		key,
		cells: {
			label: "ចំនួនទឹកប្រាក់សាច់ប្រាក់ប្រចាំខែ:",
			detail: "Cash Rolling in monthly = (Total Revenues - Total expenses - Sale invoice)",
			amount: `${formatNumber(amount)} Riel`,
		},
		rowClassName: "font-semibold",
		cellClassNames: {
			label: "font-semibold",
			detail: "font-semibold text-center",
			amount: "font-semibold text-emerald-600",
		},
	};
}

export function buildMonthlyRevenueExpenseApiRows(monthlyReport?: MonthlyReportResponse): ReportTemplateRow[] {
	if (!monthlyReport) return [];

	const expenses = monthlyReport.expenses ?? [];
	const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount ?? 0), 0);
	const accountsReceivable = monthlyReport.accountsReceivable ?? 0;
	const saleInvoice = monthlyReport.saleInvoice ?? 0;
	const cashInstallment = monthlyReport.cashInstallment ?? 0;
	const totalMonthlyIncome = accountsReceivable + saleInvoice + cashInstallment;
	const netTotal = totalMonthlyIncome - totalExpenses - saleInvoice;
	const expenseDetailRows = expenses.map((item, index) =>
		toIndentedSummaryRow(
			`monthly-expense-api-${index}`,
			item.description || `Expense ${index + 1}`,
			"",
			item.amount ?? 0,
		),
	);

	return [
		toMonthlySummarySectionRow("monthly-income-total-api", "Total monthly income", totalMonthlyIncome),
		toIndentedSummaryRow("monthly-accounts-receivable-api", "1- Accounts receivable", "", accountsReceivable),
		toIndentedSummaryRow("monthly-sale-invoice-api", "2- Sale invoice", "", saleInvoice),
		toIndentedSummaryRow("monthly-cash-installment-api", "3- Cash installment", "", cashInstallment),
		toMonthlySummarySectionRow("monthly-expense-total-api", "Total monthly expenses", totalExpenses),
		...expenseDetailRows,
		toMonthlyNetRow("monthly-net-api", netTotal),
	];
}
