import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { BackButton } from "@/core/components/common";
import { cn } from "@/core/utils";
import {
	getPaperSizePageValue,
	getPaperSizeWrapperClassName,
	getTemplateClassName,
	getTextSizeClassName,
	type OrientationMode,
	type PaperSizeMode,
	type SortMode,
	type TemplateMode,
	type TextSizeMode,
} from "@/pages/dashboard/invoice/export-preview/constants";
import { ReportFilterBar } from "../../components/layout/report-filter-bar";
import { ReportLayout } from "../../components/layout/report-layout";
import type { ReportTemplateColumn, ReportTemplateRow } from "../../components/layout/report-template-table";
import { ReportToolbar } from "../../components/layout/report-toolbar";
import { DEFAULT_REPORT_COLUMNS, DEFAULT_REPORT_SECTIONS, REPORT_DEFAULT_DATE_INPUT } from "../constants";
import { getReportDefinition } from "../report-specs";
import { createVisibleColumnMap, getReportColumnOptions, hasVisibleReportFilters } from "../report-types";
import { ReportFilters, type ReportFiltersValue } from "./report-filters";
import { ReportTable } from "./report-table";
import { isReportMonthFilterValue } from "./report-table-utils";

interface ReportDetailViewProps {
	reportSlug: string;
}

function getDefaultReportFilters(
	useDateRange = false,
	defaultShowDetail = true,
	useSingleDate = false,
): ReportFiltersValue {
	return {
		customerId: "all",
		customerTypeId: "all",
		productName: "all",
		employeeId: "all",
		fromDate: useDateRange || useSingleDate ? REPORT_DEFAULT_DATE_INPUT : "",
		toDate: useDateRange ? REPORT_DEFAULT_DATE_INPUT : "",
		useDateRange,
		showDetail: defaultShowDetail,
	};
}

const DEFAULT_REPORT_FILTER_CONFIG = {
	customer: false,
	dateRange: false,
} as const;

export function ReportDetailView({ reportSlug }: ReportDetailViewProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
	const activeTabFromQuery = searchParams.get("tab") ?? undefined;
	const activeTabFromState =
		typeof (location.state as { activeTab?: unknown } | null)?.activeTab === "string"
			? ((location.state as { activeTab?: string }).activeTab ?? undefined)
			: undefined;
	const activeTab = activeTabFromQuery ?? activeTabFromState;
	const [showSections, setShowSections] = useState(DEFAULT_REPORT_SECTIONS);
	const [showColumns, setShowColumns] = useState(DEFAULT_REPORT_COLUMNS);
	// Temporarily disabled until report export is restored with a consistent per-report flow.
	// const [exportInvoiceIds, setExportInvoiceIds] = useState<string[]>([]);
	// const [isExporting, setIsExporting] = useState(false);
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
	const initialTextSizeMode =
		searchParams.get("size") === "small" ||
		searchParams.get("size") === "normal" ||
		searchParams.get("size") === "large"
			? (searchParams.get("size") as TextSizeMode)
			: "normal";
	const [templateMode, setTemplateMode] = useState<TemplateMode>(initialTemplateMode);
	const [paperSizeMode, setPaperSizeMode] = useState<PaperSizeMode>(initialPaperSizeMode);
	const [orientationMode, setOrientationMode] = useState<OrientationMode>(initialOrientationMode);
	const [sortMode, setSortMode] = useState<SortMode>(initialSortMode);
	const [textSizeMode, setTextSizeMode] = useState<TextSizeMode>(initialTextSizeMode);
	const [tableData, setTableData] = useState<{
		rows: ReportTemplateRow[];
		columns: ReportTemplateColumn[];
		hiddenColumnKeys: string[];
		isLoading?: boolean;
		isError?: boolean;
	}>({
		rows: [],
		columns: [],
		hiddenColumnKeys: [],
		isLoading: false,
		isError: false,
	});
	const reportDefinition = useMemo(() => getReportDefinition(reportSlug), [reportSlug]);
	const defaultFilterState = useMemo(
		() => ({
			reportSlug,
			value: getDefaultReportFilters(
				!!reportDefinition.filterConfig?.dateRange,
				reportSlug !== "open-invoice-on-period-by-group",
				!!reportDefinition.filterConfig?.singleDate,
			),
		}),
		[reportDefinition.filterConfig?.dateRange, reportDefinition.filterConfig?.singleDate, reportSlug],
	);
	const [appliedFilters, setAppliedFilters] = useState<ReportFiltersValue>(defaultFilterState.value);
	const handlePrint = () => window.print();
	const handleBack = useCallback(() => {
		if (activeTab) {
			navigate(`/dashboard/reports?tab=${encodeURIComponent(activeTab)}`);
			return;
		}

		if (window.history.length > 1) {
			navigate(-1);
			return;
		}

		navigate("/dashboard/reports");
	}, [activeTab, navigate]);
	const tableWrapperClassName = useMemo(
		() => getPaperSizeWrapperClassName(paperSizeMode, orientationMode),
		[paperSizeMode, orientationMode],
	);
	const pageSizeValue = useMemo(() => getPaperSizePageValue(paperSizeMode), [paperSizeMode]);
	const templateClassName = useMemo(() => getTemplateClassName(templateMode), [templateMode]);
	const textSizeClassName = useMemo(() => getTextSizeClassName(textSizeMode), [textSizeMode]);
	const tableClassName = useMemo(
		() => cn(templateClassName, textSizeClassName),
		[templateClassName, textSizeClassName],
	);
	const hasVisibleFilters = hasVisibleReportFilters(reportDefinition.filterConfig);
	const reportColumns = useMemo(() => reportDefinition.buildColumns(), [reportDefinition]);
	const columnOptions = useMemo(() => getReportColumnOptions(reportDefinition), [reportDefinition]);
	const enableColumnCustomization = columnOptions.length > 0;

	useEffect(() => {
		setShowColumns(createVisibleColumnMap(columnOptions));
	}, [columnOptions]);

	useEffect(() => {
		setAppliedFilters(defaultFilterState.value);
	}, [defaultFilterState]);

	useEffect(() => {
		const styleId = "report-page-size-style";
		let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = `@media print {
			@page { size: ${pageSizeValue} ${orientationMode}; margin: 6mm; }
			html, body { width: auto !important; height: auto !important; }
			.report-print-page, .report-print-target { width: 100% !important; max-width: none !important; }
			.report-print-target table { width: 100% !important; max-width: none !important; table-layout: fixed !important; break-inside: auto; page-break-inside: auto; }
			.report-print-target thead { display: table-header-group !important; }
			.report-print-target tfoot { display: table-row-group !important; }
			.report-print-target tr { break-inside: avoid !important; page-break-inside: avoid !important; }
		}`;

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
		nextSearchParams.set("size", textSizeMode);
		const nextSearch = `?${nextSearchParams.toString()}`;
		if (nextSearch === location.search) return;
		navigate(`${location.pathname}${nextSearch}`, { replace: true });
	}, [
		location.pathname,
		location.search,
		navigate,
		orientationMode,
		paperSizeMode,
		sortMode,
		templateMode,
		textSizeMode,
	]);

	const handleCopy = useCallback(async () => {
		if (tableData.isLoading || tableData.isError) {
			toast.error("Cannot copy report data: data is incomplete or failed to load");
			return;
		}

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
			if (!navigator.clipboard?.writeText) {
				toast.error("Clipboard is not available in this browser");
				return;
			}
			await navigator.clipboard.writeText([headerRow, ...bodyRows].map((cells) => cells.join("\t")).join("\n"));
			toast.success("Copied current table to clipboard");
		} catch {
			toast.error("Failed to copy table data");
		}
	}, [tableData]);

	const handleSubmitFilters = useCallback(
		(nextFilters: ReportFiltersValue) => {
			if (reportDefinition.filterConfig?.monthOnly && !nextFilters.fromDate) {
				toast.error("Month is required");
				return;
			}

			if (reportDefinition.filterConfig?.monthOnly && !isReportMonthFilterValue(nextFilters.fromDate)) {
				toast.error("Month must use YYYY-MM format");
				return;
			}

			if (reportDefinition.filterConfig?.singleDate && !nextFilters.fromDate) {
				toast.error("Date is required");
				return;
			}

			if (reportDefinition.filterConfig?.dateRange && (!nextFilters.fromDate || !nextFilters.toDate)) {
				toast.error("From and To dates are required");
				return;
			}

			if (reportDefinition.filterConfig?.dateRange && nextFilters.fromDate > nextFilters.toDate) {
				toast.error("From date cannot be after To date");
				return;
			}

			setAppliedFilters(nextFilters);
			toast.success("Filters applied successfully");
		},
		[reportDefinition.filterConfig],
	);

	// const handleExportExcel = useCallback(async () => {
	// 	if (!isExcelExportReport || exportInvoiceIds.length === 0) return;
	// 	setIsExporting(true);
	// 	try {
	// 		const exportRows = await Promise.all(exportInvoiceIds.map((invoiceId) => invoiceService.getInvoice(invoiceId)));
	// 		const blob = buildInvoiceExportBlob(exportRows);
	// 		const url = URL.createObjectURL(blob);
	// 		const link = document.createElement("a");
	// 		link.href = url;
	// 		link.download = `${reportSlug}-${new Date().toISOString().slice(0, 10)}.xlsx`;
	// 		document.body.appendChild(link);
	// 		link.click();
	// 		link.remove();
	// 		URL.revokeObjectURL(url);
	// 	} catch {
	// 		toast.error("Failed to export Excel");
	// 	} finally {
	// 		setIsExporting(false);
	// 	}
	// }, [exportInvoiceIds, isExcelExportReport, reportSlug]);

	return (
		<ReportLayout className="report-print-page">
			<div className="print:hidden">
				<BackButton onClick={handleBack} />
			</div>

			{showSections.filter && hasVisibleFilters && (
				<ReportFilterBar title="Filter" icon="mdi:filter-outline" defaultOpen={true} className="print:hidden">
					<ReportFilters
						value={appliedFilters}
						onSubmit={handleSubmitFilters}
						filterConfig={reportDefinition.filterConfig ?? DEFAULT_REPORT_FILTER_CONFIG}
						reportSlug={reportSlug}
					/>
				</ReportFilterBar>
			)}

			{/* Report Toolbar */}
			<div className="flex flex-col print:block print:w-full">
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
					textSizeMode={textSizeMode}
					onTextSizeModeChange={setTextSizeMode}
					onPrint={handlePrint}
					onCopy={handleCopy}
					isCopyDisabled={tableData.isLoading || tableData.isError || tableData.rows.length === 0}
					// onExportExcel={handleExportExcel}
					// isExportExcelDisabled={!isExcelExportReport || exportInvoiceIds.length === 0 || isExporting}
					className="rounded-b-none border-b-0 print:hidden"
				/>

				{/* Report Table */}
				<div className={cn("w-full", tableWrapperClassName)}>
					<ReportTable
						columns={reportColumns}
						showSections={showSections}
						showColumns={showColumns}
						className={cn("rounded-t-none report-print-target print:w-full", tableClassName)}
						reportSlug={reportSlug}
						filters={appliedFilters}
						sortMode={sortMode}
						onTableDataChange={setTableData}
						// onInvoiceIdsChange={setExportInvoiceIds}
					/>
				</div>
			</div>
		</ReportLayout>
	);
}
