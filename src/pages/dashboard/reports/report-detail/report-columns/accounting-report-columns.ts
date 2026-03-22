import type { ReportTemplateColumn } from "../../components/layout/report-template-table";
import { buildSizedColumns } from "../report-column-helpers";

export function buildLedgerColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["date", "DATE", "w-[10%]", "center"],
		["type", "TYPE", "w-[10%]", "center"],
		["refNo", "REF NO", "w-[12%]"],
		["employee", "EMPLOYEE", "w-[14%]"],
		["memo", "MEMO", "w-[12%]"],
		["class", "CLASS", "w-[10%]"],
		["name", "NAME", "w-[14%]"],
		["product", "PRODUCT", "w-[8%]"],
		["debit", "DEBIT", "w-[13%]", "right"],
		["credit", "CREDIT", "w-[13%]", "right"],
		["balance", "BALANCE", "w-[13%]", "right"],
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

export function buildTrialBalanceColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "NO", "w-[5%]", "center"],
		["account", "ACCOUNT", "w-[40%]"],
		["debit", "DEBIT", "w-[25%]", "right"],
		["credit", "CREDIT", "w-[25%]", "right"],
	]);
}

export function buildMonthlySummaryColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["label", "DESCRIPTION", "w-[36%]"],
		["detail", "DETAIL", "w-[40%]"],
		["amount", "AMOUNT", "w-[24%]", "right"],
	]);
}
