import React from "react";
import { ReportFilterBar } from "../../components/layout/report-filter-bar";
import { ReportLayout } from "../../components/layout/report-layout";
import { ReportToolbar } from "../../components/layout/report-toolbar";
import { DEFAULT_REPORT_COLUMNS, DEFAULT_REPORT_SECTIONS } from "../constants";
import { ReportFilters } from "./report-filters";
import { ReportTable } from "./report-table";

interface ReportDetailViewProps {
	reportSlug: string;
}

export function ReportDetailView({ reportSlug }: ReportDetailViewProps) {
	const [showSections, setShowSections] = React.useState(DEFAULT_REPORT_SECTIONS);
	const [showColumns, setShowColumns] = React.useState(DEFAULT_REPORT_COLUMNS);
	const handlePrint = () => window.print();

	return (
		<ReportLayout className="report-print-page">
			{showSections.filter && (
				<ReportFilterBar title="Filter" icon="mdi:filter-outline" defaultOpen={true} className="print:hidden">
					<ReportFilters />
				</ReportFilterBar>
			)}

			<div className="flex flex-col">
				<ReportToolbar
					showSections={showSections}
					onShowSectionsChange={setShowSections}
					showColumns={showColumns}
					onShowColumnsChange={setShowColumns}
					onPrint={handlePrint}
					className="rounded-b-none border-b-0 print:hidden"
				/>

				<ReportTable
					showSections={showSections}
					showColumns={showColumns}
					className="rounded-t-none report-print-target"
					reportSlug={reportSlug}
				/>
			</div>
		</ReportLayout>
	);
}
