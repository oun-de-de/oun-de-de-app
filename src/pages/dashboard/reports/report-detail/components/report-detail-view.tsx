import invoiceService from "@/core/api/services/invoice-service";
import { BackButton } from "@/core/components/common";
import { cn } from "@/core/utils";
import {
	getPaperSizePageValue,
	getPaperSizeWrapperClassName,
	getTemplateClassName,
	type OrientationMode,
	type PaperSizeMode,
	type SortMode,
	type TemplateMode,
} from "@/pages/dashboard/invoice/export-preview/constants";
import { buildInvoiceExportBlob } from "@/pages/dashboard/invoice/export-preview/utils/invoice-export-template";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { ReportFilterBar } from "../../components/layout/report-filter-bar";
import { ReportLayout } from "../../components/layout/report-layout";
import type { ReportTemplateColumn, ReportTemplateRow } from "../../components/layout/report-template-table";
import { ReportToolbar } from "../../components/layout/report-toolbar";
import { DEFAULT_REPORT_COLUMNS, DEFAULT_REPORT_SECTIONS, REPORT_DEFAULT_DATE_INPUT } from "../constants";
import { getReportDefinition } from "../report-specs";
import { createVisibleColumnMap, getReportColumnOptions, hasVisibleReportFilters } from "../report-types";
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
	const location = useLocation();
	const navigate = useNavigate();
	const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
	const [showSections, setShowSections] = useState(DEFAULT_REPORT_SECTIONS);
	const [showColumns, setShowColumns] = useState(DEFAULT_REPORT_COLUMNS);
	const [exportInvoiceIds, setExportInvoiceIds] = useState<string[]>([]);
	const [isExporting, setIsExporting] = useState(false);
	const initialTemplateMode =
		searchParams.get("template") === "standard" ||
		searchParams.get("template") === "compact" ||
		searchParams.get("template") === "detailed"
			? (searchParams.get("template") as TemplateMode)
			: "standard";
	const initialPaperSizeMode =
		searchParams.get("paper") === "a5" || searchParams.get("paper") === "a4" || searchParams.get("paper") === "letter"
			? (searchParams.get("paper") as PaperSizeMode)
			: "a4";
	const initialOrientationMode =
		searchParams.get("orientation") === "portrait" || searchParams.get("orientation") === "landscape"
			? (searchParams.get("orientation") as OrientationMode)
			: "portrait";
	const initialSortMode =
		searchParams.get("sort") === "default" ||
		searchParams.get("sort") === "date-desc" ||
		searchParams.get("sort") === "date-asc" ||
		searchParams.get("sort") === "customer-asc" ||
		searchParams.get("sort") === "balance-desc"
			? (searchParams.get("sort") as SortMode)
			: "default";
	const [templateMode, setTemplateMode] = useState<TemplateMode>(initialTemplateMode);
	const [paperSizeMode, setPaperSizeMode] = useState<PaperSizeMode>(initialPaperSizeMode);
	const [orientationMode, setOrientationMode] = useState<OrientationMode>(initialOrientationMode);
	const [sortMode, setSortMode] = useState<SortMode>(initialSortMode);
	const [tableData, setTableData] = useState<{
		rows: ReportTemplateRow[];
		columns: ReportTemplateColumn[];
		hiddenColumnKeys: string[];
	}>({
		rows: [],
		columns: [],
		hiddenColumnKeys: [],
	});
	const [draftFilters, setDraftFilters] = useState<ReportFiltersValue>(DEFAULT_REPORT_FILTERS);
	const [appliedFilters, setAppliedFilters] = useState<ReportFiltersValue>(DEFAULT_REPORT_FILTERS);
	const hasPendingFilterChanges = !areReportFiltersEqual(draftFilters, appliedFilters);
	const handlePrint = () => window.print();
	const handleBack = useCallback(() => {
		if (window.history.length > 1) {
			navigate(-1);
			return;
		}

		navigate("/dashboard/reports");
	}, [navigate]);
	const reportDefinition = useMemo(() => getReportDefinition(reportSlug), [reportSlug]);
	const isExcelExportReport =
		reportSlug === "open-invoice-detail-by-customer" || reportSlug === "receipt-detail-by-customer";
	const tableWrapperClassName = useMemo(
		() => getPaperSizeWrapperClassName(paperSizeMode, orientationMode),
		[paperSizeMode, orientationMode],
	);
	const pageSizeValue = useMemo(() => getPaperSizePageValue(paperSizeMode), [paperSizeMode]);
	const tableClassName = useMemo(() => getTemplateClassName(templateMode), [templateMode]);
	const hasVisibleFilters = hasVisibleReportFilters(reportDefinition.filterConfig);
	const reportColumns = useMemo(() => reportDefinition.buildColumns(), [reportDefinition]);
	const columnOptions = useMemo(() => getReportColumnOptions(reportDefinition), [reportDefinition]);
	const enableColumnCustomization = columnOptions.length > 0;

	useEffect(() => {
		setShowColumns(createVisibleColumnMap(columnOptions));
	}, [reportSlug, columnOptions]);

	useEffect(() => {
		const styleId = "report-page-size-style";
		let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = `@media print { @page { size: ${pageSizeValue} ${orientationMode}; margin: 6mm; } }`;

		return () => {
			styleEl?.remove();
		};
	}, [pageSizeValue, orientationMode]);

	useEffect(() => {
		const nextSearchParams = new URLSearchParams(location.search);
		nextSearchParams.set("template", templateMode);
		nextSearchParams.set("paper", paperSizeMode);
		nextSearchParams.set("orientation", orientationMode);
		nextSearchParams.set("sort", sortMode);
		const nextSearch = `?${nextSearchParams.toString()}`;
		if (nextSearch === location.search) return;
		navigate(`${location.pathname}${nextSearch}`, { replace: true });
	}, [location.pathname, location.search, navigate, orientationMode, paperSizeMode, sortMode, templateMode]);

	const handleCopy = useCallback(async () => {
		const visibleColumns = tableData.columns.filter((column) => !tableData.hiddenColumnKeys.includes(column.id));
		if (visibleColumns.length === 0 || tableData.rows.length === 0) {
			toast.error("No table data available to copy");
			return;
		}

		const headerRow = visibleColumns.map((column) => (typeof column.header === "string" ? column.header : column.id));
		const bodyRows = tableData.rows.map((row) =>
			visibleColumns.map((column) => {
				const cellValue = row.cells[column.id];
				return typeof cellValue === "string" || typeof cellValue === "number" ? String(cellValue) : "";
			}),
		);

		try {
			await navigator.clipboard.writeText([headerRow, ...bodyRows].map((cells) => cells.join("\t")).join("\n"));
			toast.success("Copied current table to clipboard");
		} catch {
			toast.error("Failed to copy table data");
		}
	}, [tableData]);

	const handleSubmitFilters = useCallback(() => {
		if (reportDefinition.filterConfig?.singleDate && !draftFilters.fromDate) {
			toast.error("Date is required");
			return;
		}

		if (reportDefinition.filterConfig?.dateRange && (!draftFilters.fromDate || !draftFilters.toDate)) {
			toast.error("From and To dates are required");
			return;
		}

		if (reportDefinition.filterConfig?.dateRange && draftFilters.fromDate > draftFilters.toDate) {
			toast.error("From date cannot be after To date");
			return;
		}

		setAppliedFilters(draftFilters);
	}, [draftFilters, reportDefinition.filterConfig]);

	const handleResetFilters = useCallback(() => {
		setDraftFilters(appliedFilters);
	}, [appliedFilters]);

	const handleExportExcel = useCallback(async () => {
		if (!isExcelExportReport) {
			toast.error("Export Excel is only available for invoice reports");
			return;
		}

		if (exportInvoiceIds.length === 0) {
			toast.error("No invoices available to export");
			return;
		}

		try {
			setIsExporting(true);
			const exportLines = await invoiceService.listInvoiceDetails(exportInvoiceIds);
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
	}, [isExcelExportReport, exportInvoiceIds]);

	return (
		<ReportLayout className="report-print-page">
			<div className="print:hidden">
				<BackButton onClick={handleBack} />
			</div>

			{showSections.filter && hasVisibleFilters && (
				<ReportFilterBar title="Filter" icon="mdi:filter-outline" defaultOpen={true} className="print:hidden">
					<ReportFilters
						value={draftFilters}
						onChange={setDraftFilters}
						onSubmit={handleSubmitFilters}
						onReset={handleResetFilters}
						hasPendingChanges={hasPendingFilterChanges}
						filterConfig={reportDefinition.filterConfig ?? { customer: false, dateRange: false }}
					/>
				</ReportFilterBar>
			)}

			<div className="flex flex-col print:w-full print:flex-1">
				<ReportToolbar
					showSections={showSections}
					onShowSectionsChange={setShowSections}
					showColumns={showColumns}
					onShowColumnsChange={setShowColumns}
					columnOptions={columnOptions}
					enableColumnCustomization={enableColumnCustomization}
					templateMode={templateMode}
					onTemplateModeChange={setTemplateMode}
					paperSizeMode={paperSizeMode}
					onPaperSizeModeChange={setPaperSizeMode}
					orientationMode={orientationMode}
					onOrientationModeChange={setOrientationMode}
					sortMode={sortMode}
					onSortModeChange={setSortMode}
					onPrint={handlePrint}
					onCopy={handleCopy}
					onExportExcel={handleExportExcel}
					isExportExcelDisabled={!isExcelExportReport || exportInvoiceIds.length === 0 || isExporting}
					className="rounded-b-none border-b-0 print:hidden"
				/>

				<div className={cn("w-full", tableWrapperClassName)}>
					<ReportTable
						columns={reportColumns}
						showSections={showSections}
						showColumns={showColumns}
						className={cn("rounded-t-none report-print-target print:w-full", tableClassName)}
						reportSlug={reportSlug}
						filters={appliedFilters}
						sortMode={sortMode}
						onInvoiceIdsChange={setExportInvoiceIds}
						onTableDataChange={setTableData}
					/>
				</div>
			</div>
		</ReportLayout>
	);
}
