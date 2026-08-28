import type { ReactNode } from "react";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { cn } from "@/core/utils";
import { ScreenKpiCard, type ScreenKpiCardProps } from "./screen-kpi-card";

export type ScreenSummaryPanelProps = {
	title: string;
	description?: string;
	kpis: ScreenKpiCardProps[];
	actions?: ReactNode;
	className?: string;
	gridClassName?: string;
};

function getAutoGridColsClass(count: number): string {
	switch (count) {
		case 1:
			return "grid-cols-1";
		case 2:
			return "grid-cols-1 md:grid-cols-2";
		case 3:
			return "grid-cols-1 md:grid-cols-3";
		case 4:
			return "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
		case 5:
			return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5";
		default:
			return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
	}
}

export function ScreenSummaryPanel({
	title,
	description,
	kpis,
	actions,
	className,
	gridClassName,
}: ScreenSummaryPanelProps) {
	const dynamicGridCols = gridClassName || getAutoGridColsClass(kpis.length);

	return (
		<Card className={cn("w-full h-full border-slate-200/70 bg-white shadow-none", className)}>
			<CardHeader className="flex items-start justify-between gap-3 border-b border-slate-200/70 px-4 py-3.5">
				<div className="space-y-1">
					<CardTitle className="text-left text-[15px] font-semibold text-slate-800">{title}</CardTitle>
					{description ? <p className="max-w-3xl text-[13px] leading-5 text-slate-500">{description}</p> : null}
				</div>

				{actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
			</CardHeader>

			<CardContent className="p-3.5">
				<div className={cn("grid gap-3", dynamicGridCols)}>
					{kpis.map((kpi) => (
						<ScreenKpiCard key={kpi.label} {...kpi} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function ScreenSummaryAction({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<Button
			variant="outline"
			size="sm"
			className={cn(
				"h-8 gap-1.5 border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-none hover:bg-slate-50",
				className,
			)}
		>
			{children}
		</Button>
	);
}
