import { Card, CardContent } from "@/core/ui/card";
import { Text } from "@/core/ui/typography";
import { cn } from "@/core/utils";
import type { ReactNode } from "react";

export type ScreenKpiCardProps = {
	label: string;
	value: ReactNode;
	description?: ReactNode;
	icon?: ReactNode;
	tone?: "sky" | "blue" | "indigo" | "cyan";
	className?: string;
};

const TONE_STYLES: Record<NonNullable<ScreenKpiCardProps["tone"]>, { card: string; icon: string }> = {
	sky: {
		card: "border-sky-200/80 bg-sky-50/70 hover:bg-sky-50",
		icon: "bg-sky-500 text-white",
	},
	blue: {
		card: "border-blue-200/80 bg-blue-50/70 hover:bg-blue-50",
		icon: "bg-blue-500 text-white",
	},
	indigo: {
		card: "border-indigo-200/80 bg-indigo-50/70 hover:bg-indigo-50",
		icon: "bg-indigo-500 text-white",
	},
	cyan: {
		card: "border-cyan-200/80 bg-cyan-50/70 hover:bg-cyan-50",
		icon: "bg-cyan-500 text-white",
	},
};

export function ScreenKpiCard({ label, value, description, icon, tone = "sky", className }: ScreenKpiCardProps) {
	const toneStyles = TONE_STYLES[tone];
	return (
		<Card
			className={cn(
				"h-full overflow-hidden border-slate-200/70 shadow-none transition-colors hover:border-slate-300",
				toneStyles.card,
				className,
			)}
		>
			<CardContent className="flex h-full flex-col gap-3 p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<Text variant="caption" className="uppercase tracking-[0.14em] text-slate-500">
							{label}
						</Text>
						<div className="mt-1 text-[23px] font-semibold leading-none text-slate-800">{value}</div>
					</div>

					{icon ? <div className={cn("rounded-lg p-2.5 shadow-sm", toneStyles.icon)}>{icon}</div> : null}
				</div>

				{description ? <p className="text-[13px] leading-5 text-slate-500">{description}</p> : null}
			</CardContent>
		</Card>
	);
}
