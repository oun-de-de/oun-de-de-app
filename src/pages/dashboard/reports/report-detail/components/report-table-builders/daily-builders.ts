import type { DailyReportResponse } from "@/core/types/report";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { createReportRow } from "./report-row-helpers";

function buildDailyMetricRow(
	key: string,
	label: string,
	amount: string,
	metricKey: string,
	no: string | number,
	quantity = "",
): ReportTemplateRow {
	return createReportRow(key, {
		no,
		label,
		quantity,
		amount,
		metricKey,
	});
}

export function buildApiDailyReportRows(report: DailyReportResponse | undefined): ReportTemplateRow[] {
	const soldProducts = report?.soldProducts ?? [];
	const boughtItems = report?.boughtItems ?? [];
	const soldProductRows = soldProducts.map((item, index) =>
		buildDailyMetricRow(
			`daily-sold-product-${index}`,
			item.productName?.trim() || `Sold product ${index + 1}`,
			formatNumber(item.totalAmount ?? 0),
			`daily-sold-product-${index}`,
			index + 1,
			item.totalQuantity != null ? formatNumber(item.totalQuantity) : "",
		),
	);
	const summaryRows: ReportTemplateRow[] = [
		buildDailyMetricRow(
			"daily-total-revenue",
			"Total Revenues",
			formatNumber(report?.totalRevenue ?? 0),
			"daily-total-revenue",
			soldProductRows.length + 1,
		),
		buildDailyMetricRow(
			"daily-cash-received",
			"Daily Cash receive",
			formatNumber(report?.totalCashReceive ?? 0),
			"daily-cash-receive",
			soldProductRows.length + 2,
		),
		buildDailyMetricRow(
			"daily-expense-section",
			"Daily expenses",
			"",
			"daily-expense-section",
			soldProductRows.length + 3,
		),
	];
	const expenseRows = boughtItems.map((item, index) =>
		buildDailyMetricRow(
			`daily-expense-item-${index}`,
			item.itemName?.trim() || `Expense item ${index + 1}`,
			formatNumber(item.expense ?? 0),
			`daily-expense-item-${index}`,
			soldProductRows.length + index + 4,
		),
	);

	return [
		...soldProductRows,
		...summaryRows,
		...expenseRows,
		buildDailyMetricRow(
			"daily-expense-total",
			"Total expense",
			formatNumber(report?.totalExpense ?? 0),
			"daily-expense-total",
			soldProductRows.length + expenseRows.length + 4,
		),
	];
}
