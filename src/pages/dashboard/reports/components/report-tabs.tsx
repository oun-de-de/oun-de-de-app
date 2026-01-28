import { useState } from "react";
import { reportTabs } from "@/_mock/data/dashboard";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { cn } from "@/core/utils";

interface ReportTabsProps {
	className?: string;
}

export function ReportTabs({ className }: ReportTabsProps) {
	const [activeTab, setActiveTab] = useState(reportTabs[0]);

	return (
		<Card className={cn("w-full", className)}>
			<CardContent className="flex flex-wrap items-center gap-2 p-4">
				{reportTabs.map((tab) => (
					<Button
						key={tab}
						variant={activeTab === tab ? "default" : "ghost"}
						size="sm"
						className="gap-1"
						onClick={() => setActiveTab(tab)}
					>
						<Icon icon="mdi:account-outline" />
						{tab}
					</Button>
				))}
			</CardContent>
		</Card>
	);
}
