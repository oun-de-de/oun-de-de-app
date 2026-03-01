import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import cycleService from "@/core/api/services/cycle-service";
import invoiceService from "@/core/api/services/invoice-service";
import type { Cycle } from "@/core/types/cycle";
import { formatDisplayDate, formatKHR } from "@/core/utils/formatters";
import {
	buildReportRows as buildExportReportRows,
	mapExportLineToPreviewRow,
} from "../../../invoice/export-preview/utils/export-preview-rows";
import { type ReportTemplateRow, ReportTemplateTable } from "../../components/layout/report-template-table";
import type { ReportColumnVisibility, ReportSectionVisibility } from "../../components/layout/report-toolbar";
import { getReportDefinition } from "../report-registry";
import type { ReportFiltersValue } from "./report-filters";

function normalizeReportFilters(filters?: ReportFiltersValue) {
	const customerId = filters?.customerId && filters.customerId !== "all" ? filters.customerId : undefined;
	const reportDateFrom = filters?.useDateRange && filters.fromDate ? `${filters.fromDate}T00:00:00` : undefined;
	const reportDateTo = filters?.useDateRange && filters.toDate ? `${filters.toDate}T23:59:59` : undefined;

	return { customerId, reportDateFrom, reportDateTo };
}

function buildCycleReportRows(cycles: Cycle[]): ReportTemplateRow[] {
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

function buildInvoiceReportRows(
	exportLines: Awaited<ReturnType<typeof invoiceService.exportInvoice>>,
): ReportTemplateRow[] {
	return buildExportReportRows(exportLines.map(mapExportLineToPreviewRow));
}

interface ReportTableProps {
	showSections?: ReportSectionVisibility;
	showColumns?: ReportColumnVisibility;
	className?: string;
	reportSlug: string;
	filters?: ReportFiltersValue;
	onInvoiceIdsChange?: (invoiceIds: string[]) => void;
}

export function ReportTable({
	showSections,
	showColumns,
	className,
	reportSlug,
	filters,
	onInvoiceIdsChange,
}: ReportTableProps) {
	const definition = getReportDefinition(reportSlug);
	const isInvoiceListReport = reportSlug === "open-invoice-detail-by-customer";
	const isReceiptReport = reportSlug === "receipt-detail-by-customer";
	const isInvoiceBasedReport = isInvoiceListReport || isReceiptReport;
	const isCycleReport = reportSlug === "open-invoice-on-period-by-group";
	const { customerId, reportDateFrom, reportDateTo } = normalizeReportFilters(filters);

	const cycleQuery = useQuery({
		queryKey: ["report", "cycle-list", customerId ?? "all", reportDateFrom ?? "", reportDateTo ?? ""],
		queryFn: () =>
			cycleService.getCycles({
				page: 1,
				size: 10000,
				sort: "startDate,desc",
				customerId,
				from: reportDateFrom,
				to: reportDateTo,
			}),
		enabled: isCycleReport,
	});

	const invoiceQuery = useQuery({
		queryKey: ["report", "invoice-list", reportSlug, customerId ?? "all", reportDateFrom ?? "", reportDateTo ?? ""],
		queryFn: () =>
			invoiceService.getInvoices({
				page: 1,
				size: 10000,
				sort: "date,desc",
				type: isReceiptReport ? "receipt" : undefined,
				customerId,
				from: reportDateFrom,
				to: reportDateTo,
			}),
		enabled: isInvoiceBasedReport,
	});
	const invoiceIds = useMemo(
		() => (isInvoiceBasedReport ? (invoiceQuery.data?.list ?? []).map((invoice) => invoice.id) : []),
		[isInvoiceBasedReport, invoiceQuery.data?.list],
	);
	const exportQuery = useQuery({
		queryKey: ["report", "invoice-export", invoiceIds],
		queryFn: () => invoiceService.exportInvoice(invoiceIds),
		enabled: isInvoiceBasedReport && invoiceIds.length > 0,
	});

	useEffect(() => {
		onInvoiceIdsChange?.(invoiceIds);
	}, [invoiceIds, onInvoiceIdsChange]);

	let sourceRows: ReportTemplateRow[] = [];

	if (isInvoiceBasedReport) {
		sourceRows = buildInvoiceReportRows(exportQuery.data ?? []);
	} else if (isCycleReport) {
		sourceRows = buildCycleReportRows(cycleQuery.data?.list ?? []);
	}

	return (
		<ReportTemplateTable
			className={className}
			showSections={showSections}
			title={definition.title}
			subtitle={definition.subtitle}
			columns={definition.buildColumns()}
			rows={sourceRows}
			hiddenColumnKeys={definition.hiddenColumnKeys?.(showColumns) ?? []}
			summaryRows={definition.summaryRows ?? []}
		/>
	);
}
