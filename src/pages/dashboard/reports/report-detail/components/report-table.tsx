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

	return (
		<ReportTemplateTable
			className={className}
			showSections={showSections}
			title={definition.title}
			subtitle={definition.subtitle}
			columns={definition.buildColumns()}
			rows={definition.buildRows(rows)}
			hiddenColumnKeys={definition.hiddenColumnKeys?.(showColumns) ?? []}
			summaryRows={definition.summaryRows ?? []}
		/>
	);
}
