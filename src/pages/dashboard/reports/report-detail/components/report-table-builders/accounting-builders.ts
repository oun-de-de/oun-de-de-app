import { accountingRows } from "@/_mock/data/dashboard";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { parseNumericCell } from "../report-table-utils";

export function buildLedgerRows(): ReportTemplateRow[] {
	return accountingRows.map((row, index) => ({
		key: `${row.refNo}-${index}`,
		cells: {
			no: index + 1,
			date: row.date,
			refNo: row.refNo,
			account: row.type,
			memo: row.memo || row.currency,
			debit: row.dr || "-",
			credit: row.cr || "-",
		},
	}));
}

export function buildTrialBalanceRows(): ReportTemplateRow[] {
	const aggregates = accountingRows.reduce<Record<string, { debit: number; credit: number }>>((acc, row) => {
		const key = row.type;
		acc[key] = acc[key] ?? { debit: 0, credit: 0 };
		acc[key].debit += parseNumericCell(row.dr);
		acc[key].credit += parseNumericCell(row.cr);
		return acc;
	}, {});

	return Object.entries(aggregates).map(([account, totals], index) => ({
		key: `trial-${account}`,
		cells: {
			no: index + 1,
			account,
			debit: formatNumber(totals.debit),
			credit: formatNumber(totals.credit),
		},
	}));
}
