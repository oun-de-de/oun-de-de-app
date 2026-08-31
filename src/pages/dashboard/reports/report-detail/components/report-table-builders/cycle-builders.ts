import type { Cycle } from "@/core/types/cycle";
import { formatFlexibleDisplayDate } from "@/core/utils/date-display";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { createReportRow } from "./report-row-helpers";

export function buildCycleReportRows(cycles: Cycle[]): ReportTemplateRow[] {
	let totalInvoice = 0;
	let totalPaid = 0;
	let totalOutstanding = 0;

	const rows: ReportTemplateRow[] = cycles.map((cycle) => {
		const startDate = formatFlexibleDisplayDate(cycle.startDate);
		const endDate = formatFlexibleDisplayDate(cycle.endDate);
		const invoiceTotal = cycle.totalAmount ?? 0;
		const paid = cycle.totalPaidAmount ?? 0;
		const outstanding = Math.max(0, invoiceTotal - paid);

		totalInvoice += invoiceTotal;
		totalPaid += paid;
		totalOutstanding += outstanding;

		return createReportRow(cycle.id, {
			customer: cycle.customerName ?? "-",
			cycle: `${startDate} - ${endDate}`,
			invoiceTotal: formatNumber(invoiceTotal),
			paid: formatNumber(paid),
			outstanding: formatNumber(outstanding),
		});
	});

	if (cycles.length > 0) {
		rows.push({
			key: "cycle-grand-total",
			cells: {
				customer: "Total",
				cycle: "",
				invoiceTotal: formatNumber(totalInvoice),
				paid: formatNumber(totalPaid),
				outstanding: formatNumber(totalOutstanding),
			},
			rowClassName: "font-bold bg-slate-50/60",
			cellClassNames: {
				customer: "font-bold text-slate-900",
				invoiceTotal: "font-bold text-slate-900",
				paid: "font-bold text-slate-900",
				outstanding: "font-bold text-slate-900",
			},
		});
	}

	return rows;
}
