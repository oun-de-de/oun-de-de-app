import type { MonthlyReportDetailsResponse } from "@/core/types/report";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { createReportRow, createLedgerCells } from "./report-row-helpers";

export function buildMonthlyReportDetailRows(monthlyReportDetails?: MonthlyReportDetailsResponse): ReportTemplateRow[] {
	const lines = monthlyReportDetails?.lines ?? [];

	return lines.map((line, index) =>
		createReportRow(
			`income-expense-api-${line.refNo ?? "row"}-${index}`,
			createLedgerCells({
				no: index + 1,
				date: line.date ? formatDisplayDate(line.date) : "-",
				refNo: line.refNo ?? "-",
				type: line.reason ?? "-",
				name: line.customerName ?? "-",
				memo: line.memo ?? "-",
				debit: formatNumber(line.debit ?? 0),
				credit: formatNumber(line.credit ?? 0),
				balance: formatNumber(line.balance ?? 0),
			}),
		),
	);
}
