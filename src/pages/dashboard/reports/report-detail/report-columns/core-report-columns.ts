import type { ReportTemplateColumn } from "../../components/layout/report-template-table";
import { buildSizedColumns } from "../report-column-helpers";

export function buildCycleColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["customer", "Customer", "w-[25%]"],
		["cycle", "Cycle", "w-[27%]"],
		["invoiceTotal", "Invoice Total", "w-[16%]", "right"],
		["paid", "Paid", "w-[16%]", "right"],
		["outstanding", "Balance", "w-[16%]", "right"],
	]);
}

export function buildCustomerListColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "NO", "w-[5%]", "center"],
		["name", "NAME", "w-[20%]"],
		["code", "CODE", "w-[10%]", "center"],
		["phone", "PHONE", "w-[15%]"],
		["geography", "GEOGRAPHY", "w-[15%]"],
		["address", "ADDRESS", "w-[35%]"],
	]);
}
