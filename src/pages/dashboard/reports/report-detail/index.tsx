import React from "react";
import { ReportFilterBar } from "../components/layout/report-filter-bar";
import { ReportLayout } from "../components/layout/report-layout";
import { ReportToolbar } from "../components/layout/report-toolbar";
import { ReportFilters } from "./components/report-filters";
import { ReportTable } from "./components/report-table";
import { DEFAULT_REPORT_COLUMNS, DEFAULT_REPORT_SECTIONS } from "./constants";

export default function ReportDetailTemplate() {
	const [showSections, setShowSections] = React.useState(DEFAULT_REPORT_SECTIONS);

	const [showColumns, setShowColumns] = React.useState(DEFAULT_REPORT_COLUMNS);

	return (
		<ReportLayout>
			{showSections.filter && (
				<ReportFilterBar title="Filter" icon="mdi:filter-outline" defaultOpen={true}>
					<ReportFilters />
				</ReportFilterBar>
			)}

			<div className="flex flex-col">
				<ReportToolbar
					showSections={showSections}
					onShowSectionsChange={setShowSections}
					showColumns={showColumns}
					onShowColumnsChange={setShowColumns}
					className="rounded-b-none border-b-0"
				/>

				<ReportTable showSections={showSections} showColumns={showColumns} className="rounded-t-none" />
			</div>
		</ReportLayout>
	);
}
