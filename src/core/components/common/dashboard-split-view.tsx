import type { ReactNode } from "react";
import { Card, CardContent } from "@/core/ui/card";

type DashboardSplitViewProps = {
	sidebar: ReactNode;
	content: ReactNode;
	className?: string;
};

export function DashboardSplitView({ sidebar, content, className = "" }: DashboardSplitViewProps) {
	return (
		<div className={`flex flex-col lg:flex-row gap-4 w-full h-full ${className}`}>
			<Card className="w-full lg:w-1/4 lg:h-full shrink-0">
				<CardContent className="h-full flex flex-col p-4">{sidebar}</CardContent>
			</Card>

			<Card className="w-full lg:flex-1 lg:h-full min-w-0">
				<CardContent className="h-full flex flex-col gap-4 p-4">{content}</CardContent>
			</Card>
		</div>
	);
}
