import type { ReactNode } from "react";
import { Card, CardContent } from "@/core/ui/card";

type DashboardSplitViewProps = {
	sidebar: ReactNode;
	content: ReactNode;
	className?: string;
};

export function DashboardSplitView({
	sidebar,
	content,
	className = "lg:grid-cols-[280px_1fr]",
}: DashboardSplitViewProps) {
	return (
		<div className="flex w-full flex-col gap-4 h-full">
			<div className={`grid grid-cols-1 gap-4 h-full ${className}`}>
				<Card className="h-full">
					<CardContent className="h-full flex flex-col p-4">{sidebar}</CardContent>
				</Card>

				<Card className="h-full">
					<CardContent className="h-full flex flex-col gap-4 p-4">{content}</CardContent>
				</Card>
			</div>
		</div>
	);
}
