import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { reportSections } from "@/_mock/data/dashboard";
import { ScreenSummaryPanel } from "@/core/components/common";
import type { ScreenKpiCardProps } from "@/core/components/common/screen-kpi-card";
import Icon from "@/core/components/icon/icon";
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
	const activeTab =
		requestedTab && reportSections.some((section) => section.tab === requestedTab) ? requestedTab : DEFAULT_REPORT_TAB;

	const handleTabChange = (nextTab: string) => {
		const nextSearchParams = new URLSearchParams(searchParams);
		nextSearchParams.set("tab", nextTab);
		setSearchParams(nextSearchParams, { replace: true });
	};

	const displaySections = useMemo(() => {
		if (activeTab === "All") return reportSections;
		return reportSections.filter((section) => section.tab === activeTab);
	}, [activeTab]);

	const summary = useMemo<ScreenKpiCardProps[]>(() => {
		const categoryCount = displaySections.length;
		const reportCount = displaySections.reduce((acc, section) => acc + section.items.length, 0);
		// const favoriteCount = displaySections.reduce(
		//   (acc, section) =>
		//     acc + section.items.filter((item) => item.favorite).length,
		//   0,
		// );

		return [
			{
				label: "Categories",
				value: String(categoryCount),
				icon: <Icon icon="mdi:view-grid-outline" size={18} />,
				tone: "sky",
			},
			{
				label: "Reports",
				value: String(reportCount),
				icon: <Icon icon="mdi:file-chart-outline" size={18} />,
				tone: "blue",
			},
			// {
			// 	label: "Favorites",
			// 	value: String(favoriteCount),
			// 	icon: <Icon icon="mdi:star-outline" size={18} />,
			// 	tone: "cyan",
			// },
			{
				label: "Current tab",
				value: activeTab,
				icon: <Icon icon="mdi:folder-outline" size={18} />,
				tone: "indigo",
			},
		];
	}, [activeTab, displaySections]);

	return (
		<div className="flex w-full flex-col gap-3 overflow-auto">
			<ScreenSummaryPanel title="Report overview" kpis={summary} />

			<ReportTabs activeTab={activeTab} onTabChange={handleTabChange} />

			{displaySections.map((section) => (
				<ReportSection key={section.title} section={section} activeTab={activeTab} />
			))}
		</div>
	);
}
