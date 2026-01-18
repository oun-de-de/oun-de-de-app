import Icon from "@/core/components/icon/icon";
import type { EntitySelectType } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { cn } from "@/core/utils";
import FilterItem from "./filter-item";

// Filter Configuration Arrays
const DURATION_OPTIONS: EntitySelectType[] = [
	{ key: "hour", value: "hour", label: "Hour" },
	{ key: "day", value: "day", label: "Day" },
	{ key: "week", value: "week", label: "Week" },
	{ key: "month", value: "month", label: "Month" },
	{ key: "year", value: "year", label: "Year" },
];

const EVENT_OPTIONS: EntitySelectType[] = [
	{ key: "all", value: "all", label: "Select event..." },
	{ key: "sale", value: "sale", label: "Sale Invoice" },
	{ key: "journal", value: "journal", label: "Journal Entry" },
];

const USER_OPTIONS: EntitySelectType[] = [
	{ key: "all", value: "all", label: "Select user..." },
	{ key: "lc1988", value: "lc1988", label: "lc1988" },
	{ key: "lmchann", value: "lmchann", label: "lmchann" },
];

const TYPE_OPTIONS: EntitySelectType[] = [
	{ key: "all", value: "all", label: "Select type..." },
	{ key: "add", value: "add", label: "Add" },
	{ key: "update", value: "update", label: "Update" },
];

// Filter Configuration
const FILTER_CONFIG = [
	{ id: "duration", options: DURATION_OPTIONS, placeholder: "Duration" },
	{ id: "event", options: EVENT_OPTIONS, placeholder: "Select event..." },
	{ id: "user", options: USER_OPTIONS, placeholder: "Select user..." },
	{ id: "type", options: TYPE_OPTIONS, placeholder: "Select type..." },
] as const;

export type AuditLogFilterValues = {
	duration?: string;
	event?: string;
	user?: string;
	type?: string;
	search?: string;
};

export type AuditLogFilterBarProps = {
	className?: string;
	values?: AuditLogFilterValues;
	onFilterChange?: (key: keyof AuditLogFilterValues, value: string) => void;
};

export function AuditLogFilterBar({ className, values, onFilterChange }: AuditLogFilterBarProps) {
	return (
		<div className={cn("flex flex-col gap-4", className)}>
			<div className="grid grid-cols-1 gap-2 lg:grid-cols-6 items-center">
				<Input type="date" className="w-full" />

				{FILTER_CONFIG.map((filter) => (
					<FilterItem
						key={filter.id}
						options={filter.options}
						value={values?.[filter.id as keyof AuditLogFilterValues] || "all"}
						onChange={(val) => onFilterChange?.(filter.id as keyof AuditLogFilterValues, val)}
						placeholder={filter.placeholder}
					/>
				))}
			</div>

			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<Input
						placeholder="Search..."
						className="pl-9"
						value={values?.search || ""}
						onChange={(e) => onFilterChange?.("search", e.target.value)}
					/>
					<Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
				</div>
				<Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
					<Icon icon="mdi:filter-variant" />
				</Button>
			</div>
		</div>
	);
}
