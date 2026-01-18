import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { cn } from "@/core/utils";

export type SidebarListHeaderProps = {
	className?: string;
	// Main Type Select
	mainTypeOptions?: { value: string; label: string }[];
	mainTypePlaceholder?: string;
	mainTypeValue?: string;
	onMainTypeChange?: (value: string) => void;

	// Menu Button
	onMenuClick?: () => void;

	// Search
	searchPlaceholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;

	// Status Filter
	statusOptions?: { value: string; label: string }[];
	statusPlaceholder?: string;
	statusValue?: string;
	onStatusChange?: (value: string) => void;
};

export function SidebarListHeader({
	className,
	mainTypeOptions = [],
	mainTypePlaceholder = "Select Type",
	mainTypeValue,
	onMainTypeChange,
	onMenuClick,
	searchPlaceholder = "Search...",
	searchValue,
	onSearchChange,
	statusOptions = [
		{ value: "active", label: "Active" },
		{ value: "inactive", label: "Inactive" },
	],
	statusPlaceholder = "Active",
	statusValue,
	onStatusChange,
}: SidebarListHeaderProps) {
	return (
		<div className={cn("flex flex-col gap-3", className)}>
			{/* Top Row: Type Select + Menu */}
			<div className="flex items-center gap-2">
				<Select value={mainTypeValue} onValueChange={onMainTypeChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder={mainTypePlaceholder} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="type">{mainTypePlaceholder}</SelectItem>
						{mainTypeOptions.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={onMenuClick}>
					<Icon icon="mdi:menu" />
				</Button>
			</div>

			{/* Bottom Row: Search + Status */}
			<div className="flex gap-2">
				<Input
					placeholder={searchPlaceholder}
					value={searchValue}
					onChange={(e) => onSearchChange?.(e.target.value)}
					className="flex-1"
				/>
				<Select value={statusValue} onValueChange={onStatusChange} defaultValue="active">
					<SelectTrigger className="w-[110px] shrink-0">
						<SelectValue placeholder={statusPlaceholder} />
					</SelectTrigger>
					<SelectContent>
						{statusOptions.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
