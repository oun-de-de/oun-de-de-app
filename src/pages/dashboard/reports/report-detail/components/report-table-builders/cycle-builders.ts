import type { Cycle } from "@/core/types/cycle";
import { formatDisplayDate, formatKHR } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";

export function buildCycleReportRows(cycles: Cycle[]): ReportTemplateRow[] {
	return cycles.map((cycle) => {
		const startDate = formatDisplayDate(cycle.startDate);
		const endDate = formatDisplayDate(cycle.endDate);
		const invoiceTotal = cycle.totalAmount ?? 0;
		const paid = cycle.totalPaidAmount ?? 0;
		const outstanding = Math.max(0, invoiceTotal - paid);

		return {
			key: cycle.id,
			cells: {
				customer: cycle.customerName ?? "-",
				cycle: `${startDate} - ${endDate}`,
				openingBalance: 0,
				invoiceTotal: formatKHR(invoiceTotal),
				paid: formatKHR(paid),
				outstanding: formatKHR(outstanding),
			},
		};
	});
}
