import type { OpenInvoiceCustomerGroup } from "@/core/types/report";
import { formatFlexibleDisplayDate } from "@/core/utils/date-display";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { createReportRow } from "./report-row-helpers";

export function buildCycleReportRows(groups: OpenInvoiceCustomerGroup[], showDetail = true): ReportTemplateRow[] {
	const rows: ReportTemplateRow[] = [];
	let grandTotalInvoice = 0;
	let grandTotalPaid = 0;
	let grandTotalOutstanding = 0;

	groups.forEach((group, groupIndex) => {
		const customerName = group.customerName ?? "-";
		let custTotalInvoice = 0;
		let custTotalPaid = 0;
		let custTotalOutstanding = 0;

		rows.push({
			key: `cycle-customer-header-${groupIndex}-${customerName}`,
			isStructural: true,
			cells: {
				no: groupIndex + 1,
				customer: customerName,
				cycle: "",
				refNo: "",
				invoiceTotal: "",
				paid: "",
				outstanding: "",
			},
			rowClassName: "font-semibold bg-slate-50/40",
			cellClassNames: {
				customer: "font-semibold text-slate-900",
			},
		});

		(group.cycles ?? []).forEach((cycle, cycleIndex) => {
			const startDate = formatFlexibleDisplayDate(cycle.cycleStartDate);
			const endDate = formatFlexibleDisplayDate(cycle.cycleEndDate);
			const invoiceTotal = cycle.totalOriginalAmount ?? 0;
			const paid = cycle.totalPaidAmount ?? 0;
			const outstanding = cycle.balance ?? Math.max(0, invoiceTotal - paid);

			custTotalInvoice += invoiceTotal;
			custTotalPaid += paid;
			custTotalOutstanding += outstanding;

			rows.push(
				createReportRow(`cycle-${groupIndex}-${cycleIndex}`, {
					no: "",
					customer: "",
					cycle: `${startDate} - ${endDate}`,
					refNo: "",
					invoiceTotal: formatNumber(invoiceTotal),
					paid: formatNumber(paid),
					outstanding: formatNumber(outstanding),
				}),
			);

			if (showDetail) {
				(cycle.invoices ?? []).forEach((inv, invIndex) => {
					rows.push(
						createReportRow(`cycle-detail-${groupIndex}-${cycleIndex}-${invIndex}-${inv.refNo}`, {
							no: "",
							customer: "",
							cycle: formatFlexibleDisplayDate(inv.date),
							refNo: inv.refNo ?? "-",
							invoiceTotal: formatNumber(inv.originalAmount),
							paid: "",
							outstanding: "",
						}),
					);
				});
			}
		});

		grandTotalInvoice += custTotalInvoice;
		grandTotalPaid += custTotalPaid;
		grandTotalOutstanding += custTotalOutstanding;

		rows.push({
			key: `cycle-customer-subtotal-${groupIndex}-${customerName}`,
			isStructural: true,
			cells: {
				no: "",
				customer: "",
				cycle: `Total(${(group.cycles ?? []).length})`,
				refNo: "",
				invoiceTotal: formatNumber(custTotalInvoice),
				paid: formatNumber(custTotalPaid),
				outstanding: formatNumber(custTotalOutstanding),
			},
			rowClassName: "font-bold bg-slate-50/60",
			cellClassNames: {
				cycle: "font-bold text-slate-800 text-center",
				invoiceTotal: "font-bold text-slate-900",
				paid: "font-bold text-slate-900",
				outstanding: "font-bold text-slate-900",
			},
		});
	});

	if (groups.length > 0) {
		rows.push({
			key: "cycle-grand-total",
			isStructural: true,
			cells: {
				no: "",
				customer: "TOTAL",
				cycle: "",
				refNo: "",
				invoiceTotal: formatNumber(grandTotalInvoice),
				paid: formatNumber(grandTotalPaid),
				outstanding: formatNumber(grandTotalOutstanding),
			},
			rowClassName: "font-bold bg-slate-100/80 border-t-2 border-slate-300",
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
