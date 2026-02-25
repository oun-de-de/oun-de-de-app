import { useEffect, useState } from "react";
import { useDebounce } from "@/core/hooks";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { cn } from "@/core/utils";
import { SidebarToggleButton } from "./sidebar-list";

type SidebarOption = { value: string; label: string };
const MAIN_TYPE_PLACEHOLDER_VALUE = "__main_type_placeholder__";

export type SidebarListHeaderProps = {
	className?: string;
	// Main Type Select
	showMainTypeFilter?: boolean;
	mainTypeOptions?: SidebarOption[];
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
	statusOptions?: SidebarOption[];
	statusPlaceholder?: string;
	statusValue?: string;
	onStatusChange?: (value: string) => void;

	isCollapsed?: boolean;
};

type SearchStatusRowProps = {
	searchPlaceholder: string;
	localSearch: string;
	onLocalSearchChange: (value: string) => void;
	resolvedStatusLabel?: string;
	statusOptions: SidebarOption[];
	statusPlaceholder: string;
	statusValue?: string;
	onStatusChange?: (value: string) => void;
};

function SearchStatusRow({
	searchPlaceholder,
	localSearch,
	onLocalSearchChange,
	resolvedStatusLabel,
	statusOptions,
	statusPlaceholder,
	statusValue,
	onStatusChange,
}: SearchStatusRowProps) {
	return (
		<div className="flex gap-2">
			<Input
				placeholder={searchPlaceholder}
				value={localSearch}
				onChange={(e) => onLocalSearchChange(e.target.value)}
				className="flex-1"
			/>
			<Select value={statusValue} onValueChange={onStatusChange}>
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
	);
}

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
				<SidebarToggleButton onClick={onMenuClick} isCollapsed={isCollapsed} variant="info" />
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-3 pb-2 md:pb-3", className)}>
			<div className="flex items-center gap-2">
				{showMainTypeFilter ? (
					(mainTypeFilter ?? (
						<Select
							value={mainTypeValue}
							onValueChange={(value) => {
								if (value === MAIN_TYPE_PLACEHOLDER_VALUE) return;
								onMainTypeChange?.(value);
							}}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={mainTypePlaceholder}>{resolvedMainTypeLabel}</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={MAIN_TYPE_PLACEHOLDER_VALUE} disabled>
									{mainTypePlaceholder}
								</SelectItem>
								{mainTypeOptions.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					))
				) : (
					<SearchStatusRow
						searchPlaceholder={searchPlaceholder}
						localSearch={localSearch}
						onLocalSearchChange={setLocalSearch}
						resolvedStatusLabel={resolvedStatusLabel}
						statusOptions={statusOptions}
						statusPlaceholder={statusPlaceholder}
						statusValue={statusValue}
						onStatusChange={onStatusChange}
					/>
				)}
				<SidebarToggleButton onClick={onMenuClick} isCollapsed={false} variant="info" />
			</div>

			{showMainTypeFilter && (
				<SearchStatusRow
					searchPlaceholder={searchPlaceholder}
					localSearch={localSearch}
					onLocalSearchChange={setLocalSearch}
					resolvedStatusLabel={resolvedStatusLabel}
					statusOptions={statusOptions}
					statusPlaceholder={statusPlaceholder}
					statusValue={statusValue}
					onStatusChange={onStatusChange}
				/>
			)}
		</div>
	);
}
