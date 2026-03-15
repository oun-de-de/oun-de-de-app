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
		<div className={cn("flex h-full w-full min-w-0 flex-col gap-2 md:gap-3 lg:flex-row", className)}>
			{sidebar && (
				<Card
					className={cn(
						"h-full w-full min-w-0 shrink-0 transition-all duration-300 print:hidden lg:w-[16rem] xl:w-1/5",
						sidebarClassName,
					)}
				>
					<CardContent className="flex h-full min-h-0 flex-col p-3 xl:p-4">{sidebar}</CardContent>
				</Card>
			)}

			<Card className="h-full w-full min-w-0 flex-1 overflow-hidden print:border-none print:shadow-none">
				<CardContent className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-2 print:overflow-visible print:p-0 xl:gap-4 xl:p-3">
					{content}
				</CardContent>
			</Card>
		</div>
	);
}
