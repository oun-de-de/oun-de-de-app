import { Link } from "react-router";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";

interface ReportItemProps {
	label: string;
	isFavorite: boolean;
	onToggleFavorite: (label: string) => void;
	className?: string;
}

export function ReportItem({ label, isFavorite, onToggleFavorite, className }: ReportItemProps) {
	const slug = label.toLowerCase().replace(/\s+/g, "-");
	const href = `/dashboard/reports/detail/${slug}`;

	return (
		<div className={cn("flex items-center justify-between rounded-md border px-3 py-2 text-sm", className)}>
			<Link to={href} className="flex-1 text-slate-500 hover:text-sky-600 hover:underline">
				{label}
			</Link>

			<Button
				variant="ghost"
				size="icon"
				className="h-auto w-auto p-1 hover:bg-transparent"
				onClick={() => onToggleFavorite(label)}
			>
				<Icon
					icon={isFavorite ? "mdi:star" : "mdi:star-outline"}
					size={"1.2em"}
					className={isFavorite ? "text-sky-500" : "text-slate-500"}
				/>
			</Button>
		</div>
	);
}
