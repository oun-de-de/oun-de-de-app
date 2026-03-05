import { reportTabs } from "@/_mock/data/dashboard";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { cn } from "@/core/utils";

const TAB_ICONS: Record<string, string> = {
	Customer: "mdi:account-outline",
	// Vendor: "mdi:store-outline",
	Inventory: "mdi:package-variant-closed",
	Accounting: "mdi:calculator-variant-outline",
};

interface ReportTabsProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
	className?: string;
}

export function ReportTabs({ activeTab, onTabChange, className }: ReportTabsProps) {
	return (
		<Card className={cn("w-full", className)}>
			<CardContent className="flex flex-wrap items-center gap-2 p-4">
				{reportTabs.map((tab) => (
					<Button
						key={tab}
						variant={activeTab === tab ? "default" : "ghost"}
						size="sm"
						className="gap-1"
						onClick={() => onTabChange(tab)}
					>
						<Icon icon={TAB_ICONS[tab] ?? "mdi:file-document-outline"} />
						{tab}
					</Button>
				))}
			</CardContent>
		</Card>
	);
}
