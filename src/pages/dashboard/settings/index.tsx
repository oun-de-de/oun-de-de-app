import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { Button } from "@/core/ui/button";
import { SETTINGS_MENU_BY_TAB, SETTINGS_TOP_TABS } from "./constants";
import { SettingsContent } from "./components/settings-content";
import { SettingsSidebar } from "./components/settings-sidebar";
import { SettingsProvider } from "./settings-provider";

export default function SettingsPage() {
	return (
		<SettingsProvider>
			<SettingsView />
		</SettingsProvider>
	);
}

function SettingsView() {
	const location = useLocation();
	const [activeTab, setActiveTab] = useState<(typeof SETTINGS_TOP_TABS)[number]>(SETTINGS_TOP_TABS[0]);
	const activeItems = useMemo(() => SETTINGS_MENU_BY_TAB[activeTab], [activeTab]);
	const [activeItem, setActiveItem] = useState(activeItems[0] ?? "");
	const { isCollapsed, handleToggle } = useSidebarCollapse();

	useEffect(() => {
		setActiveItem(activeItems[0] ?? "");
	}, [activeItems]);

	useEffect(() => {
		const navState = location.state as { tab?: string } | null;
		if (!navState?.tab) return;

		const normalizedTarget = navState.tab.toLowerCase();
		for (const tab of SETTINGS_TOP_TABS) {
			const matchedItem = SETTINGS_MENU_BY_TAB[tab].find((item) => item.toLowerCase() === normalizedTarget);
			if (matchedItem) {
				setActiveTab(tab);
				setActiveItem(matchedItem);
				return;
			}
		}
	}, [location.state]);

	return (
		<div className="flex w-full flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2 bg-slate-50 py-1 md:py-2">
				{SETTINGS_TOP_TABS.map((tab) => (
					<Button
						key={tab}
						variant={activeTab === tab ? "secondary" : "outline"}
						size="sm"
						onClick={() => setActiveTab(tab)}
						className={
							activeTab === tab
								? "min-w-[7.5rem] justify-center bg-sky-500 px-3 font-semibold text-white hover:bg-sky-500/90 hover:text-white"
								: "min-w-[7.5rem] justify-center px-3 text-slate-600 hover:bg-white hover:text-slate-900"
						}
					>
						{tab}
					</Button>
				))}
			</div>

			<DashboardSplitView
				className="gap-0"
				isSidebarCollapsed={isCollapsed}
				sidebarClassName={isCollapsed ? "lg:w-14 xl:w-14" : "lg:w-[16rem] xl:w-1/5"}
				sidebarCardClassName="border-0 shadow-none rounded-none"
				sidebarContentClassName="p-0"
				contentCardClassName="border-0 shadow-none rounded-none"
				contentClassName="p-0 gap-0"
				sidebar={
					<SettingsSidebar
						items={activeItems}
						activeItem={activeItem}
						onSelect={setActiveItem}
						onToggle={handleToggle}
						isCollapsed={isCollapsed}
						title={activeTab === "Accounting" ? "Accounting Settings" : "Settings"}
					/>
				}
				content={<SettingsContent activeItem={activeItem} />}
			/>
		</div>
	);
}
