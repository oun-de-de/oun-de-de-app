import type { MonthlyReportDetailsResponse } from "@/core/types/report";
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
const DEFAULT_OPENING_BALANCE = 1_303_709_200;

export const DEFAULT_CASH_TRANSACTION_ROWS: readonly CashTransactionLineItem[] = [
	{
		date: "2026-08-19",
		refNo: "REC5271",
		type: "Receipt",
		name: "អតិថិជនទូទៅ",
		memo: "បំណុលលើការទូទាត់វិក្កយបត្រលេខ : IN00021263, IN00021264, IN00021265,",
		debit: 810_000,
		credit: 0,
	},
	{
		date: "2026-08-19",
		refNo: "REC5272",
		type: "Receipt",
		name: "ម៉ាក់ ស្រីដូច",
		memo: "បំណុលលើការទូទាត់វិក្កយបត្រលេខ : IN00021266, IN00021267,",
		debit: 264_000,
		credit: 0,
	},
	{
		date: "2026-08-19",
		refNo: "EXPEXPEXPEXPEXPEXPEXPEXPEXPEXPEXPEXPEXPEXPEXP006714",
		type: "Expense",
		name: "",
		memo: "សំរាប់",
		debit: 0,
		credit: 1_000_000,
	},
];

function createAccountHeaderRow(accountName: string, openingBalance: number): ReportTemplateRow {
	return {
		key: `account-header-${accountName}`,
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

function mapApiLinesToCashItems(lines: NonNullable<MonthlyReportDetailsResponse["lines"]>): CashTransactionLineItem[] {
	return lines.map((line) => ({
		date: line.date ?? "",
		refNo: line.refNo ?? "-",
		type: line.reason ?? (line.debit ? "Receipt" : "Expense"),
		name: line.customerName ?? "",
		memo: line.memo ?? "",
		debit: line.debit ?? 0,
		credit: line.credit ?? 0,
	}));
}

export function buildCashTransactionReportRows(
	monthlyReportDetails?: MonthlyReportDetailsResponse,
): ReportTemplateRow[] {
	const rawLines = monthlyReportDetails?.lines ?? [];
	const items = rawLines.length > 0 ? mapApiLinesToCashItems(rawLines) : [...DEFAULT_CASH_TRANSACTION_ROWS];

	let currentBalance = DEFAULT_OPENING_BALANCE;
	let totalDebit = 0;
	let totalCredit = 0;

	const rows: ReportTemplateRow[] = [createAccountHeaderRow(DEFAULT_CASH_ACCOUNT_NAME, DEFAULT_OPENING_BALANCE)];

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
