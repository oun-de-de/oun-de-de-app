import React, { useEffect, useMemo } from "react";
import type { SortMode } from "../../../invoice/export-preview/constants";
import {
	type ReportTemplateColumn,
	type ReportTemplateRow,
	ReportTemplateTable,
} from "../../components/layout/report-template-table";
import type { ReportColumnVisibility, ReportSectionVisibility } from "../../components/layout/report-toolbar";
import { formatReportTimestamp } from "../constants";
import type { ReportFiltersValue } from "./report-filters";
import { buildReportPresentation } from "./report-table-presentation";
import { useReportTableData } from "./use-report-table-data";

const EMPTY_ARRAY: any[] = [];

interface ReportTableProps {
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
	}) => void;
}

export const ReportTable = React.memo(function ReportTable({
	showSections,
	showColumns,
	className,
	reportSlug,
	filters,
	sortMode = "default",
	onInvoiceIdsChange,
	onTableDataChange,
}: ReportTableProps) {
	const { definition, invoiceIds, previewRows, sortedRows } = useReportTableData({ reportSlug, filters, sortMode });
	const columns = useMemo(() => definition.buildColumns(), [definition]);
	const hiddenColumnKeys = useMemo(() => definition.hiddenColumnKeys?.(showColumns) ?? [], [definition, showColumns]);
	const presentation = useMemo(
		() => buildReportPresentation(reportSlug, definition.title, filters, sortedRows, previewRows),
		[definition.title, filters, previewRows, reportSlug, sortedRows],
	);

	useEffect(() => {
		onInvoiceIdsChange?.(invoiceIds);
	}, [invoiceIds, onInvoiceIdsChange]);

	useEffect(() => {
		onTableDataChange?.({ rows: sortedRows, columns, hiddenColumnKeys });
	}, [sortedRows, columns, hiddenColumnKeys, onTableDataChange]);

	return (
		<ReportTemplateTable
			className={className}
			showSections={showSections}
			title={definition.title}
			subtitle={definition.subtitle}
			headerContent={presentation.headerContent}
			metaColumns={presentation.metaColumns}
			columns={columns}
			rows={sortedRows}
			hiddenColumnKeys={hiddenColumnKeys}
			summaryRows={presentation.summaryRows ?? definition.summaryRows ?? EMPTY_ARRAY}
			emptyText={presentation.emptyText ?? definition.emptyText}
			timestampText={formatReportTimestamp("administrator", new Date())}
		/>
	);
});
