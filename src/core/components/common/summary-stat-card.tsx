import styled from "styled-components";
import Icon from "@/core/components/icon/icon";
import type { SummaryStatCardData } from "@/core/types/common";
import { Text, Title } from "@/core/ui/typography";
import { formatNumber } from "@/core/utils/formatters";

type SummaryCardClasses = {
	root: string;
	icon: string;
	label: string;
};

function resolveSummaryCardClasses(color: string): SummaryCardClasses {
	switch (color) {
		case "bg-amber-500":
			return {
				root: "border-none bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-sm",
				icon: "bg-white/20 text-white",
				label: "text-white",
			};
		case "bg-orange-500":
			return {
				root: "border-none bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm",
				icon: "bg-white/20 text-white",
				label: "text-white",
			};
		case "bg-red-500":
			return {
				root: "border-none bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-sm",
				icon: "bg-white/20 text-white",
				label: "text-white",
			};
		case "bg-blue-500":
			return {
				root: "border-none bg-gradient-to-r from-blue-500 to-sky-400 text-white shadow-sm",
				icon: "bg-white/20 text-white",
				label: "text-white",
			};
		case "bg-indigo-500":
			return {
				root: "border-none bg-gradient-to-r from-indigo-500 to-indigo-400 text-white shadow-sm",
				icon: "bg-white/20 text-white",
				label: "text-white",
			};
		case "bg-emerald-500":
			return {
				root: "border-none bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-sm",
				icon: "bg-white/20 text-white",
				label: "text-white",
			};
		case "bg-green-500":
			return {
				root: "border-none bg-gradient-to-r from-green-500 to-green-400 text-white shadow-sm",
				icon: "bg-white/20 text-white",
				label: "text-white",
			};
		case "bg-slate-500":
			return {
				root: "border-none bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-sm",
				icon: "bg-white/15 text-white",
				label: "text-white",
			};
		case "bg-violet-500":
			return {
				root: "border-none bg-gradient-to-r from-violet-500 to-violet-400 text-white shadow-sm",
				icon: "bg-white/20 text-white",
				label: "text-white",
			};
		case "bg-sky-500":
		default:
			return {
				root: "border-none bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-sm",
				icon: "bg-white/20 text-white",
				label: "text-white",
			};
	}
}

const CardRoot = styled.div.attrs<{ $rootClassName: string }>(({ $rootClassName }) => ({
	className: `flex items-center justify-between rounded-lg px-2.5 py-1.5 ${$rootClassName}`,
}))``;

const LabelText = styled(Text).attrs<{ $labelClassName: string }>(({ $labelClassName }) => ({
	variant: "caption",
	className: `text-[11px] leading-4 ${$labelClassName}`,
}))``;

const ValueTitle = styled(Title).attrs({
	as: "h6",
	className: "text-sm font-bold leading-5 text-white",
})``;

const IconWrap = styled.span.attrs<{ $iconClassName: string }>(({ $iconClassName }) => ({
	className: `flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md ${$iconClassName}`,
}))``;

export function SummaryStatCard({ label, value, color, icon }: SummaryStatCardData) {
	const displayValue = typeof value === "number" ? formatNumber(value) : value;
	const classes = resolveSummaryCardClasses(color);

	return (
		<CardRoot $rootClassName={classes.root}>
			<div className="min-w-0 pr-2">
				<LabelText $labelClassName={classes.label}>{label}</LabelText>
				<ValueTitle>{displayValue}</ValueTitle>
			</div>
			<IconWrap $iconClassName={classes.icon}>
				<Icon icon={icon} size={14} />
			</IconWrap>
		</CardRoot>
	);
}
