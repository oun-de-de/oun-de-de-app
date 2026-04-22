import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { reportSections } from "@/_mock/data/dashboard";
import { ReportSection } from "./components/report-section";
import { ReportTabs } from "./components/report-tabs";
import { ReportsProvider } from "./reports-provider";

const DEFAULT_REPORT_TAB = "Customer";

export default function ReportsPage() {
	return (
		<ReportsProvider>
			<ReportsView />
		</ReportsProvider>
	);
}

function ReportsView() {
	const [searchParams, setSearchParams] = useSearchParams();
	const requestedTab = searchParams.get("tab");
	const activeTab = reportSections.some((section) => section.tab === requestedTab) ? requestedTab! : DEFAULT_REPORT_TAB;

	const handleTabChange = (nextTab: string) => {
		const nextSearchParams = new URLSearchParams(searchParams);
		nextSearchParams.set("tab", nextTab);
		setSearchParams(nextSearchParams, { replace: true });
	};

	const displaySections = useMemo(() => {
		return reportSections.filter((section) => section.tab === activeTab);
	}, [activeTab]);

	return (
		<div className="flex w-full flex-col gap-4">
			<ReportTabs activeTab={activeTab} onTabChange={handleTabChange} />

			{displaySections.map((section) => (
				<ReportSection
					key={section.title}
					section={section}
					activeTab={activeTab}
				/>
			))}
		</div>
	);
}
