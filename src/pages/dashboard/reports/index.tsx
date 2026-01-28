import { reportSections } from "@/_mock/data/dashboard";
import { ReportSection } from "./components/report-section";
import { ReportTabs } from "./components/report-tabs";
import { ReportsProvider } from "./reports-provider";
import { useReportsActions, useReportsState } from "./stores/reports-store";

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

	const nonFavoriteSections = reportSections.filter((section) => section.title !== "Favorite");

	const favoriteItems = nonFavoriteSections
		.flatMap((section) => section.items)
		.filter((item) => favorites.includes(item.label));

	const favoriteSection = {
		title: "Favorite",
		icon: "mdi:star",
		items: favoriteItems,
	};

	const displaySections = [...(favoriteItems.length > 0 ? [favoriteSection] : []), ...nonFavoriteSections];

	return (
		<div className="flex w-full flex-col gap-4">
			<ReportTabs />

			{displaySections.map((section) => (
				<ReportSection key={section.title} section={section} favorites={favorites} onToggleFavorite={toggleFavorite} />
			))}
		</div>
	);
}
