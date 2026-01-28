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
	return (
		<div className={cn("flex items-center justify-between rounded-md border px-3 py-2 text-sm", className)}>
			<span className="text-slate-500">{label}</span>
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
