import type { ReactNode } from "react";
import { Card, CardContent } from "@/core/ui/card";
import { cn } from "@/core/utils";

type DashboardSplitViewProps = {
	sidebar: ReactNode;
	content: ReactNode;
	className?: string;
	sidebarClassName?: string;
};

export function DashboardSplitView({ sidebar, content, className = "", sidebarClassName }: DashboardSplitViewProps) {
	return (
		<div className={cn("flex flex-col lg:flex-row gap-4 w-full h-full", className)}>
			{sidebar && (
				<Card
					className={cn("w-full lg:w-1/4 shrink-0 transition-all duration-300 h-full print:hidden", sidebarClassName)}
				>
					<CardContent className="flex flex-col p-4 h-full">{sidebar}</CardContent>
				</Card>
			)}

			<Card className="w-full flex-1 min-w-0 h-full print:border-none print:shadow-none">
				<CardContent className="flex flex-col gap-4 p-4 h-full min-h-0 overflow-y-auto print:overflow-visible print:p-0">
					{content}
				</CardContent>
			</Card>
		</div>
	);
}
