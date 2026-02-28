import { useQuery } from "@tanstack/react-query";
import cycleService from "@/core/api/services/cycle-service";
import invoiceService from "@/core/api/services/invoice-service";
import { formatDateToYYYYMMDD } from "@/core/utils/date-utils";
import { type ReportTemplateRow, ReportTemplateTable } from "../../components/layout/report-template-table";
import type { ReportColumnVisibility, ReportSectionVisibility } from "../../components/layout/report-toolbar";
import { getReportDefinition } from "../report-registry";

interface ReportTableProps {
	showSections?: ReportSectionVisibility;
	showColumns?: ReportColumnVisibility;
	className?: string;
	rows?: ReportTemplateRow[];
	reportSlug: string;
}

export function ReportTable({ showSections, showColumns, className, rows = [], reportSlug }: ReportTableProps) {
	const definition = getReportDefinition(reportSlug);
	const isInvoiceListReport = reportSlug === "open-invoice-detail-by-customer";
	const isCycleReport = reportSlug === "open-invoice-on-period-by-group";

	const invoiceQuery = useQuery({
		queryKey: ["report", "invoice-list"],
		queryFn: () => invoiceService.getInvoices({ page: 1, size: 10000, sort: "date,desc" }),
		enabled: isInvoiceListReport,
	});

	const cycleQuery = useQuery({
		queryKey: ["report", "cycle-list"],
		queryFn: () => cycleService.getCycles({ page: 1, size: 10000, sort: "createdAt,desc" }),
		enabled: isCycleReport,
	});

	let sourceRows: ReportTemplateRow[] | undefined = rows;

	if (isInvoiceListReport) {
		sourceRows = (invoiceQuery.data?.list ?? []).map((invoice) => ({
			key: invoice.id,
			cells: {
				invoiceNo: invoice.refNo ?? "-",
				invoiceDate: invoice.date ? formatDateToYYYYMMDD(new Date(invoice.date)) : "-",
				customer: invoice.customerName ?? "-",
				couponId: invoice.couponId ?? "-",
				cycle: invoice.cycle ?? "-",
				amountVnd: invoice.amount != null ? Number(invoice.amount).toLocaleString() : "-",
				paymentTerm: invoice.paymentTerm ?? "-",
				createdBy: invoice.createdBy ?? "-",
			},
		}));
	} else if (isCycleReport) {
		sourceRows = (cycleQuery.data?.list ?? []).map((cycle) => {
			const startDate = new Date(cycle.startDate).toLocaleDateString();
			const endDate = new Date(cycle.endDate).toLocaleDateString();
			const invoiceTotal = cycle.totalAmount ?? 0;
			const paid = cycle.totalPaidAmount ?? 0;
			const outstanding = Math.max(0, invoiceTotal - paid);

			return {
				key: cycle.id,
				cells: {
					customer: cycle.customerName ?? "-",
					cycle: `${startDate} - ${endDate}`,
					openingBalance: 0,
					invoiceTotal: invoiceTotal,
					paid: paid,
					outstanding: outstanding,
				},
			};
		});
	}

	return (
		<ReportTemplateTable
			className={className}
			showSections={showSections}
			title={definition.title}
			subtitle={definition.subtitle}
			columns={definition.buildColumns()}
			rows={definition.buildRows(sourceRows)}
			hiddenColumnKeys={definition.hiddenColumnKeys?.(showColumns) ?? []}
			summaryRows={definition.summaryRows ?? []}
		/>
	);
}
