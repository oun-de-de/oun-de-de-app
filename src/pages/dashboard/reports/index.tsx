import { useMemo, useState } from "react";
import { reportSections } from "@/_mock/data/dashboard";
import { ReportSection } from "./components/report-section";
import { ReportTabs } from "./components/report-tabs";
import { ReportsProvider } from "./reports-provider";
import { useReportsActions, useReportsState } from "./stores/reports-store";

const DEFAULT_REPORT_TAB = "Customer";

function isFavoriteReport(favorites: string[], slug: string, label: string) {
	return favorites.includes(slug) || favorites.includes(label);
}

export default function ReportsPage() {
	return (
		<ReportsProvider>
			<ReportsView />
		</ReportsProvider>
	);
}

function ReportsView() {
	const { favorites } = useReportsState();
	const { toggleFavorite } = useReportsActions();
	const [activeTab, setActiveTab] = useState(DEFAULT_REPORT_TAB);

	const displaySections = useMemo(() => {
		const sections = reportSections.filter((section) => section.tab === activeTab);
		const favoriteItems = sections
			.flatMap((section) => section.items)
			.filter((item) => isFavoriteReport(favorites, item.slug, item.label));

		return favoriteItems.length > 0
			? [{ tab: activeTab, title: "Favorite", icon: "mdi:star", items: favoriteItems }, ...sections]
			: sections;
	}, [activeTab, favorites]);

	return (
		<div className="flex w-full flex-col gap-4">
			<ReportTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{displaySections.map((section) => (
				<ReportSection key={section.title} section={section} favorites={favorites} onToggleFavorite={toggleFavorite} />
			))}
		</div>
	);
}
