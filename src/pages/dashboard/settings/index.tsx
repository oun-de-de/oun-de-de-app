import { useState } from "react";
import { settingsLeftMenu, settingsTopTabs } from "@/_mock/data/dashboard";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { SettingsContent } from "./components/settings-content";
import { SettingsSidebar } from "./components/settings-sidebar";

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState(settingsTopTabs[0]);
	const [activeItem, setActiveItem] = useState(settingsLeftMenu[0]);

	return (
		<div className="flex w-full flex-col gap-4">
			<Card>
				<CardContent className="flex flex-wrap items-center gap-2 p-3">
					{settingsTopTabs.map((tab) => (
						<Button
							key={tab}
							variant={activeTab === tab ? "default" : "ghost"}
							size="sm"
							onClick={() => setActiveTab(tab)}
						>
							{tab}
						</Button>
					))}
				</CardContent>
			</Card>

			<DashboardSplitView
				sidebar={<SettingsSidebar activeItem={activeItem} onSelect={setActiveItem} />}
				content={<SettingsContent activeItem={activeItem} />}
				className="lg:grid-cols-[260px_1fr]"
			/>
		</div>
	);
}
