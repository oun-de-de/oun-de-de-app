import type { CashTransactionReportResponse, MonthlyReportDetailsResponse } from "@/core/types/report";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { createLedgerCells, createReportRow } from "./report-row-helpers";

interface CashTransactionLineItem {
	date: string;
	refNo: string;
	type: string;
	name: string;
	memo: string;
	debit: number;
	credit: number;
}

const DEFAULT_CASH_ACCOUNT_NAME = "10110 : ប្រាក់សុទ្ធ (Cash on hand)";

function createAccountHeaderRow(accountName: string, openingBalance: number): ReportTemplateRow {
	return {
		key: `account-header-${accountName}`,
		isStructural: true,
		cells: {
			no: accountName,
			date: "",
			refNo: "",
			type: "",
			name: "",
			memo: "",
			debit: "",
			credit: "",
			balance: formatNumber(openingBalance),
		},
		rowClassName: "font-bold bg-slate-50/50",
	};
}

function createCashTransactionRow(
	item: CashTransactionLineItem,
	index: number,
	runningBalance: number,
): ReportTemplateRow {
	return {
		key: `cash-tx-row-${index}-${item.refNo}`,
		cells: {
			no: index + 1,
			date: item.date ? formatDisplayDate(item.date) : "-",
			refNo: item.refNo,
			type: item.type,
			name: item.name || "",
			memo: item.memo || "",
			debit: item.debit ? formatNumber(item.debit) : "",
			credit: item.credit ? formatNumber(item.credit) : "",
			balance: formatNumber(runningBalance),
		},
	};
}

function createAccountSubtotalRow(
	accountName: string,
	totalDebit: number,
	totalCredit: number,
	endingBalance: number,
): ReportTemplateRow {
	return {
		key: `account-subtotal-${accountName}`,
		cells: {
			no: `Total ${accountName}`,
			date: "",
			refNo: "",
			type: "",
			name: "",
			memo: "",
			debit: formatNumber(totalDebit),
			credit: formatNumber(totalCredit),
			balance: formatNumber(endingBalance),
		},
		rowClassName: "font-bold bg-slate-50/50",
	};
}

function createGrandTotalRow(totalDebit: number, totalCredit: number): ReportTemplateRow {
	const netChange = totalDebit - totalCredit;
	return {
		key: "cash-grand-total",
		cells: {
			no: "Total",
			date: "",
			refNo: "",
			type: "",
			name: "",
			memo: "",
			debit: formatNumber(totalDebit),
			credit: formatNumber(totalCredit),
			balance: formatNumber(netChange),
		},
		rowClassName: "font-bold",
	};
}

function mapApiLinesToCashItems(lines: NonNullable<CashTransactionReportResponse["lines"]>): CashTransactionLineItem[] {
	return lines.map((line) => ({
		date: line.date ?? "",
		refNo: line.refNo ?? "-",
		type: line.type ?? (line.debit ? "Receipt" : "Expense"),
		name: line.name ?? "",
		memo: line.memo ?? "",
		debit: line.debit ?? 0,
		credit: line.credit ?? 0,
	}));
}

export function buildCashTransactionReportRows(
	cashTransactionReport?: CashTransactionReportResponse,
): ReportTemplateRow[] {
	const items = mapApiLinesToCashItems(cashTransactionReport?.lines ?? []);
	const openingBalance = cashTransactionReport?.initCashOnHand ?? 0;

	let currentBalance = openingBalance;
	let totalDebit = 0;
	let totalCredit = 0;

	const rows: ReportTemplateRow[] = [createAccountHeaderRow(DEFAULT_CASH_ACCOUNT_NAME, openingBalance)];

	items.forEach((item, index) => {
		currentBalance += item.debit - item.credit;
		totalDebit += item.debit;
		totalCredit += item.credit;
		rows.push(createCashTransactionRow(item, index, currentBalance));
	});

	rows.push(
		createAccountSubtotalRow(DEFAULT_CASH_ACCOUNT_NAME, totalDebit, totalCredit, currentBalance),
		createGrandTotalRow(totalDebit, totalCredit),
	);

	return rows;
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
