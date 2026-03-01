import React from "react";
import { toast } from "sonner";
import invoiceService from "@/core/api/services/invoice-service";
import { buildInvoiceExportBlob } from "@/pages/dashboard/invoice/export-preview/utils/invoice-export-template";
import { ReportFilterBar } from "../../components/layout/report-filter-bar";
import { ReportLayout } from "../../components/layout/report-layout";
import { ReportToolbar } from "../../components/layout/report-toolbar";
import { DEFAULT_REPORT_COLUMNS, DEFAULT_REPORT_SECTIONS, REPORT_DEFAULT_DATE_INPUT } from "../constants";
import { getReportDefinition } from "../report-registry";
import { ReportFilters, type ReportFiltersValue } from "./report-filters";
import { ReportTable } from "./report-table";

interface ReportDetailViewProps {
	reportSlug: string;
}

const DEFAULT_REPORT_FILTERS: ReportFiltersValue = {
	customerId: "all",
	fromDate: REPORT_DEFAULT_DATE_INPUT,
	toDate: REPORT_DEFAULT_DATE_INPUT,
	useDateRange: true,
};

function areReportFiltersEqual(left: ReportFiltersValue, right: ReportFiltersValue) {
	return (
		left.customerId === right.customerId &&
		left.fromDate === right.fromDate &&
		left.toDate === right.toDate &&
		left.useDateRange === right.useDateRange
	);
}

export function ReportDetailView({ reportSlug }: ReportDetailViewProps) {
	const [showSections, setShowSections] = React.useState(DEFAULT_REPORT_SECTIONS);
	const [showColumns, setShowColumns] = React.useState(DEFAULT_REPORT_COLUMNS);
	const [exportInvoiceIds, setExportInvoiceIds] = React.useState<string[]>([]);
	const [isExporting, setIsExporting] = React.useState(false);
	const [draftFilters, setDraftFilters] = React.useState<ReportFiltersValue>(DEFAULT_REPORT_FILTERS);
	const [appliedFilters, setAppliedFilters] = React.useState<ReportFiltersValue>(DEFAULT_REPORT_FILTERS);
	const hasPendingFilterChanges = !areReportFiltersEqual(draftFilters, appliedFilters);
	const handlePrint = () => window.print();
	const reportDefinition = React.useMemo(() => getReportDefinition(reportSlug), [reportSlug]);
	const isInvoiceListReport =
		reportSlug === "open-invoice-detail-by-customer" || reportSlug === "receipt-detail-by-customer";
	const handleSubmitFilters = () => {
		if (!draftFilters.fromDate || !draftFilters.toDate) {
			toast.error("From and To dates are required");
			return;
		}

		if (draftFilters.fromDate > draftFilters.toDate) {
			toast.error("From date cannot be after To date");
			return;
		}

		setAppliedFilters(draftFilters);
	};
	const handleResetFilters = () => {
		setDraftFilters(appliedFilters);
	};
	const handleExportExcel = async () => {
		if (!isInvoiceListReport) {
			toast.error("Export Excel is only available for invoice reports");
			return;
		}

		if (exportInvoiceIds.length === 0) {
			toast.error("No invoices available to export");
			return;
		}

		try {
			setIsExporting(true);
			const exportLines = await invoiceService.exportInvoice(exportInvoiceIds);
			const blob = buildInvoiceExportBlob(exportLines);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `invoice-report-export-${Date.now()}.xlsx`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			toast.success("Invoice report exported successfully");
		} catch {
			toast.error("Failed to export invoice report");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<ReportLayout className="report-print-page">
			{showSections.filter && (
				<ReportFilterBar title="Filter" icon="mdi:filter-outline" defaultOpen={true} className="print:hidden">
					<ReportFilters
						value={draftFilters}
						onChange={setDraftFilters}
						onSubmit={handleSubmitFilters}
						onReset={handleResetFilters}
						hasPendingChanges={hasPendingFilterChanges}
					/>
				</ReportFilterBar>
			)}

			<div className="flex flex-col">
				<ReportToolbar
					showSections={showSections}
					onShowSectionsChange={setShowSections}
					showColumns={showColumns}
					onShowColumnsChange={setShowColumns}
					columnLabels={reportDefinition.columnLabels}
					onPrint={handlePrint}
					onExportExcel={handleExportExcel}
					isExportExcelDisabled={!isInvoiceListReport || exportInvoiceIds.length === 0 || isExporting}
					className="rounded-b-none border-b-0 print:hidden"
				/>

				<ReportTable
					showSections={showSections}
					showColumns={showColumns}
					className="rounded-t-none report-print-target"
					reportSlug={reportSlug}
					filters={appliedFilters}
					onInvoiceIdsChange={setExportInvoiceIds}
				/>
			</div>
		</ReportLayout>
	);
}
