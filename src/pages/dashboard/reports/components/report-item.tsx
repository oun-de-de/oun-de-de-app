import { Link } from "react-router";
import { cn } from "@/core/utils";

interface ReportItemProps {
	slug: string;
	label: string;
	activeTab: string;
	className?: string;
}

export function ReportItem({ slug, label, activeTab, className }: ReportItemProps) {
	const href = `/dashboard/reports/detail/${slug}?tab=${encodeURIComponent(activeTab)}`;

	return (
		<div className={cn("flex items-center justify-between rounded-md border px-3 py-2 text-sm", className)}>
			<Link to={href} className="flex-1 text-slate-500 hover:text-sky-600 hover:underline">
				{label}
			</Link>

			{/* Temporarily hidden as requested */}
		</div>
	);
}
