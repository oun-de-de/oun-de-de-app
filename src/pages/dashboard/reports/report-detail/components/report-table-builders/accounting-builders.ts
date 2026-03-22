import type { MonthlyReportDetailsResponse } from "@/core/types/report";
import { accountingRows } from "@/_mock/data/dashboard";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { parseNumericCell } from "../report-table-utils";
import { createIndexedReportRow, createLedgerCells, createReportRow } from "./report-row-helpers";

export function buildLedgerRows(): ReportTemplateRow[] {
	let runningBalance = 0;

	return accountingRows.map((row, index) => {
		const debit = parseNumericCell(row.dr);
		const credit = parseNumericCell(row.cr);
		runningBalance += debit - credit;

		return createReportRow(
			`${row.refNo}-${index}`,
			createLedgerCells({
				date: row.date,
				refNo: row.refNo,
				type: row.type,
				name: row.type,
				memo: row.memo || row.currency || "-",
				debit: row.dr || "-",
				credit: row.cr || "-",
				balance: formatNumber(runningBalance),
				extraCells: {
					employee: "General Employee",
					class: row.currency || "General",
					product: "-",
				},
			}),
		);
	});
}

export function buildIncomeExpenseLedgerRows(): ReportTemplateRow[] {
	let runningBalance = 0;

	return accountingRows.map((row, index) => {
		const debit = parseNumericCell(row.dr);
		const credit = parseNumericCell(row.cr);
		runningBalance += debit - credit;

		return createReportRow(
			`income-expense-${row.refNo}-${index}`,
			createLedgerCells({
				no: index + 1,
				date: row.date,
				refNo: row.refNo,
				type: row.type,
				name: row.type || "-",
				memo: row.memo || row.currency || "-",
				debit: row.dr || "-",
				credit: row.cr || "-",
				balance: formatNumber(runningBalance),
			}),
		);
	});
}

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

export function buildTrialBalanceRows(): ReportTemplateRow[] {
	const aggregates = accountingRows.reduce<Record<string, { debit: number; credit: number }>>((acc, row) => {
		const key = row.type;
		acc[key] = acc[key] ?? { debit: 0, credit: 0 };
		acc[key].debit += parseNumericCell(row.dr);
		acc[key].credit += parseNumericCell(row.cr);
		return acc;
	}, {});

	return Object.entries(aggregates).map(([account, totals], index) =>
		createIndexedReportRow(`trial-${account}`, index, {
			account,
			debit: formatNumber(totals.debit),
			credit: formatNumber(totals.credit),
		}),
	);
}
