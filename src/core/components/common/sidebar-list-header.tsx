import { useEffect, useState } from "react";
import { useDebounce } from "@/core/hooks";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { cn } from "@/core/utils";
import { SidebarToggleButton } from "./sidebar-list";

export type SidebarListHeaderProps = {
	className?: string;
	// Main Type Select
	showMainTypeFilter?: boolean;
	mainTypeOptions?: { value: string; label: string }[];
	mainTypePlaceholder?: string;
	mainTypeValue?: string;
	onMainTypeChange?: (value: string) => void;
	mainTypeFilter?: React.ReactNode;

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

	isCollapsed?: boolean;
};

export function SidebarListHeader({
	className,
	showMainTypeFilter = true,
	mainTypeOptions = [],
	mainTypePlaceholder = "Select Type",
	mainTypeValue,
	onMainTypeChange,
	mainTypeFilter,
	onMenuClick,
	searchPlaceholder = "Search...",
	searchValue = "",
	onSearchChange,
	statusOptions = [
		{ value: "active", label: "Active" },
		{ value: "inactive", label: "Inactive" },
	],
	statusPlaceholder = "Active",
	statusValue,
	onStatusChange,
	isCollapsed,
}: SidebarListHeaderProps) {
	const [localSearch, setLocalSearch] = useState(searchValue);
	const debouncedSearch = useDebounce(localSearch, 300);
	const resolvedMainTypeLabel =
		mainTypeValue !== undefined
			? (mainTypeOptions.find((opt) => opt.value === mainTypeValue)?.label ?? mainTypeValue)
			: undefined;
	const resolvedStatusLabel =
		statusValue !== undefined
			? (statusOptions.find((opt) => opt.value === statusValue)?.label ?? statusValue)
			: undefined;

	useEffect(() => {
		setLocalSearch(searchValue);
	}, [searchValue]);

	useEffect(() => {
		if (debouncedSearch !== searchValue) {
			onSearchChange?.(debouncedSearch);
		}
	}, [debouncedSearch, onSearchChange, searchValue]);

	if (isCollapsed) {
		return (
			<div className={cn("flex w-full justify-center p-2", className)}>
				<SidebarToggleButton onClick={onMenuClick} isCollapsed={isCollapsed} variant="outline" />
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-3 pb-2 md:pb-4", className)}>
			{/* Top Row: Type Select + Menu */}
			<div className="flex items-center gap-2">
				{showMainTypeFilter ? (
					(mainTypeFilter ?? (
						<Select value={mainTypeValue} onValueChange={onMainTypeChange}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={mainTypePlaceholder}>{resolvedMainTypeLabel}</SelectValue>
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
					))
				) : (
					<div className="flex-1" />
				)}
				<SidebarToggleButton onClick={onMenuClick} isCollapsed={false} variant="outline" />
			</div>

			{/* Bottom Row: Search + Status */}
			<div className="flex gap-2">
				<Input
					placeholder={searchPlaceholder}
					value={localSearch}
					onChange={(e) => setLocalSearch(e.target.value)}
					className="flex-1"
				/>
				<Select value={statusValue} onValueChange={onStatusChange} defaultValue="active">
					<SelectTrigger className="w-[110px] shrink-0">
						<SelectValue placeholder={statusPlaceholder}>{resolvedStatusLabel}</SelectValue>
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
