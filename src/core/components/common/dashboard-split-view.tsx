import type { ReactNode } from "react";
import { Card, CardContent } from "@/core/ui/card";
import { cn } from "@/core/utils";

type DashboardSplitViewProps = {
	sidebar: ReactNode;
	content: ReactNode;
	className?: string;
	isSidebarCollapsed?: boolean;
	sidebarClassName?: string;
	sidebarCardClassName?: string;
	sidebarContentClassName?: string;
	contentCardClassName?: string;
	contentClassName?: string;
};

export function DashboardSplitView({
	sidebar,
	content,
	className = "",
	isSidebarCollapsed = false,
	sidebarClassName,
	sidebarCardClassName,
	sidebarContentClassName,
	contentCardClassName,
	contentClassName,
}: DashboardSplitViewProps) {
	return (
		<div
			className={cn(
				"flex h-full min-h-0 w-full min-w-0 flex-col gap-2 print:block print:h-auto print:min-h-0 md:flex-row md:gap-3",
				className,
			)}
		>
			{sidebar && (
				<Card
					className={cn(
						"h-full min-h-0 w-full min-w-0 shrink-0 overflow-hidden transition-all duration-300 print:hidden md:w-[16rem] xl:w-1/5",
						sidebarClassName,
						sidebarCardClassName,
					)}
				>
					<CardContent
						className={cn(
							"flex h-full min-h-0 flex-col",
							isSidebarCollapsed ? "p-1" : "p-3 xl:p-2",
							sidebarContentClassName,
						)}
					>
						{sidebar}
					</CardContent>
				</Card>
			)}

			<Card
				className={cn(
					"h-full w-full min-w-0 flex-1 overflow-hidden print:h-auto print:overflow-visible print:border-none print:shadow-none",
					contentCardClassName,
				)}
			>
				<CardContent
					className={cn(
						"flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-2 print:overflow-visible print:p-0 xl:gap-4 xl:p-3",
						contentClassName,
					)}
				>
					{content}
				</CardContent>
			</Card>
		</div>
	);
}
