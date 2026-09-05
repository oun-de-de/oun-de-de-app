import React, { useEffect, useMemo } from "react";
import type { SortMode } from "../../../invoice/export-preview/constants";
import {
	type ReportTemplateColumn,
	type ReportTemplateRow,
	type ReportTemplateSummaryRow,
	ReportTemplateTable,
} from "../../components/layout/report-template-table";
import type { ReportColumnVisibility, ReportSectionVisibility } from "../../components/layout/report-toolbar";
import { formatReportTimestamp } from "../constants";
import type { ReportFiltersValue } from "./report-filters";
import { buildReportPresentation } from "./report-table-presentation-builders";
import { useReportTableData } from "./use-report-table-data";

const EMPTY_SUMMARY_ROWS: ReportTemplateSummaryRow[] = [];
const EMPTY_ROWS: ReportTemplateRow[] = [];

interface ReportTableProps {
	columns: ReportTemplateColumn[];
	showSections?: ReportSectionVisibility;
	showColumns?: ReportColumnVisibility;
	className?: string;
	reportSlug: string;
	filters?: ReportFiltersValue;
	sortMode?: SortMode;
	onInvoiceIdsChange?: (invoiceIds: string[]) => void;
	onTableDataChange?: (payload: {
		rows: ReportTemplateRow[];
		columns: ReportTemplateColumn[];
		hiddenColumnKeys: string[];
		isLoading?: boolean;
		isError?: boolean;
	}) => void;
}

export const ReportTable = React.memo(function ReportTable({
	columns,
	showSections,
	showColumns,
	className,
	reportSlug,
	filters,
	sortMode = "default",
	onInvoiceIdsChange,
	onTableDataChange,
}: ReportTableProps) {
	const {
		definition,
		invoiceIds,
		previewRows,
		selectedCustomerLabel,
		selectedCustomer,
		selectedCustomerTypeLabel,
		customerTypeCustomerCount,
		sourceRows,
		sortedRows,
		isLoading,
		isError,
		refetch,
	} = useReportTableData({
		reportSlug,
		filters,
		sortMode,
	});
	const hiddenColumnKeys = useMemo(
		() =>
			Object.entries(showColumns ?? {})
				.filter(([, isVisible]) => isVisible === false)
				.map(([columnKey]) => columnKey),
		[showColumns],
	);
	const presentation = useMemo(
		() =>
			buildReportPresentation({
				templateId: definition.templateId,
				reportSlug,
				title: definition.title,
				filterConfig: definition.filterConfig,
				filters,
				selectedCustomerLabel,
				selectedCustomer,
				selectedCustomerTypeLabel,
				customerTypeCustomerCount,
				rows: sourceRows,
				previewRows,
			}),
		[
			definition.templateId,
			definition.title,
			definition.filterConfig,
			filters,
			previewRows,
			reportSlug,
			selectedCustomer,
			selectedCustomerLabel,
			selectedCustomerTypeLabel,
			customerTypeCustomerCount,
			sourceRows,
		],
	);

	useEffect(() => {
		onInvoiceIdsChange?.(invoiceIds);
	}, [invoiceIds, onInvoiceIdsChange]);

	useEffect(() => {
		onTableDataChange?.({ rows: sortedRows, columns, hiddenColumnKeys, isLoading, isError });
	}, [sortedRows, columns, hiddenColumnKeys, isLoading, isError, onTableDataChange]);

	const emptyText = isError ? (
		<div className="flex flex-col items-center justify-center gap-2 py-4 text-red-600">
			<span>Failed to load report data.</span>
			<button
				type="button"
				onClick={refetch}
				className="rounded bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600 transition-colors"
			>
				Retry
			</button>
		</div>
	) : isLoading ? (
		"Loading..."
	) : (
		(presentation.emptyText ?? definition.emptyText)
	);

	return (
		<ReportTemplateTable
			className={className}
			showSections={showSections}
			title={definition.title}
			subtitle={definition.subtitle}
			headerContent={presentation.headerContent}
			metaColumns={presentation.metaColumns}
			showTableHeader={presentation.showTableHeader}
			columns={columns}
			rows={isLoading || isError ? EMPTY_ROWS : sortedRows}
			hiddenColumnKeys={hiddenColumnKeys}
			summaryRows={
				isLoading || isError
					? EMPTY_SUMMARY_ROWS
					: (presentation.summaryRows ?? definition.summaryRows ?? EMPTY_SUMMARY_ROWS)
			}
			emptyText={emptyText}
			timestampText={formatReportTimestamp("administrator", new Date())}
		/>
	);
});
