import type { ReportTemplateColumn } from "../../components/layout/report-template-table";
import { buildSizedColumns } from "../report-column-helpers";

export function buildCashTransactionColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "No", "w-[5%]", "center"],
		["date", "Date", "w-[11%]", "center"],
		["refNo", "Ref No.", "w-[15%]"],
		["type", "TYPE", "w-[10%]", "center"],
		["name", "NAME", "w-[16%]"],
		["memo", "MEMO", "w-[18%]"],
		["debit", "DEBIT", "w-[11%]", "right"],
		["credit", "CREDIT", "w-[11%]", "right"],
		["balance", "BALANCE", "w-[13%]", "right"],
	]);
}

export function buildLedgerColumns(): ReportTemplateColumn[] {
	// Columns mirror buildMonthlyReportDetailRows; EMPLOYEE / CLASS / PRODUCT were dropped because
	// that builder never emits those keys.
	return buildSizedColumns([
		["date", "DATE", "w-[12%]", "center"],
		["type", "TYPE", "w-[12%]", "center"],
		["refNo", "REF NO", "w-[15%]"],
		["name", "NAME", "w-[18%]"],
		["memo", "MEMO", "w-[15%]"],
		["debit", "DEBIT", "w-[9%]", "right"],
		["credit", "CREDIT", "w-[9%]", "right"],
		["balance", "BALANCE", "w-[10%]", "right"],
	]);
}

export function buildIncomeExpenseLedgerColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "NO", "w-[6%]", "center"],
		["date", "DATE", "w-[12%]", "center"],
		["refNo", "REF NO", "w-[15%]"],
		["type", "REASON", "w-[12%]", "center"],
		["name", "NAME", "w-[18%]"],
		["memo", "MEMO", "w-[17%]"],
		["debit", "DEBIT", "w-[10%]", "right"],
		["credit", "CREDIT", "w-[10%]", "right"],
		["balance", "BALANCE", "w-[12%]", "right"],
	]);
}

export function buildMonthlySummaryColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["label", "DESCRIPTION", "w-[36%]"],
		["detail", "DETAIL", "w-[40%]"],
		["amount", "AMOUNT", "w-[24%]", "right"],
	]);
}
