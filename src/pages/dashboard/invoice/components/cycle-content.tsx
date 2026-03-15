import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { Cycle, CycleStatus } from "@/core/types/cycle";
import { Button } from "@/core/ui/button";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	useComboboxAnchor,
} from "@/core/ui/combobox";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Text } from "@/core/ui/typography";
import { cn } from "@/core/utils";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CYCLE_STATUS_OPTIONS, DURATION_OPTIONS } from "../constants/constants";
import { useCycleTable } from "../hooks/use-cycle-table";
import { getCycleColumns } from "./cycle-columns";

type CycleContentProps = {
	customerId: string | null;
	customerName: string | null;
	onSelectCycle: (cycle: Cycle) => void;
	requireCustomer?: boolean;
};

const sanitizeDurationInput = (value: string) => value.replace(/\D+/g, "");
const ALL_DURATION_LABEL = "All Duration";

const getDurationDisplayValue = (duration: number) => {
	if (duration === 0) return ALL_DURATION_LABEL;
	return String(duration);
};

const getDurationOption = (duration: number) => ({
	value: String(duration),
	label: `${duration} Day${duration === 1 ? "" : "s"}`,
});

function normalizeDurationInput(value: string) {
	const trimmedValue = value.trim();
	if (trimmedValue.toLowerCase() === ALL_DURATION_LABEL.toLowerCase()) {
		return ALL_DURATION_LABEL;
	}
	return sanitizeDurationInput(trimmedValue);
}

export function CycleContent({ customerId, customerName, onSelectCycle, requireCustomer = false }: CycleContentProps) {
	const navigate = useNavigate();
	const {
		cycles,
		summaryCards,
		searchValue,
		setSearchValue,
		duration,
		status,
		fromDate,
		toDate,
		setFromDate,
		setToDate,
		onDurationChange,
		onStatusChange,
		onResetFilters,
		currentPage,
		pageSize,
		totalItems,
		totalPages,
		paginationItems,
		onPageChange,
		onPageSizeChange,
		isLoading,
	} = useCycleTable(customerId, requireCustomer);

	const [durationInput, setDurationInput] = useState(() => getDurationDisplayValue(duration));
	const durationAnchorRef = useComboboxAnchor();
	const durationOptions = useMemo(() => {
		if (duration <= 0 || DURATION_OPTIONS.some((option) => option.value === String(duration))) {
			return DURATION_OPTIONS;
		}

		return [...DURATION_OPTIONS, getDurationOption(duration)].sort(
			(left, right) => Number(left.value) - Number(right.value),
		);
	}, [duration]);
	const selectedDurationOption = useMemo(
		() => durationOptions.find((option) => option.value === String(duration)) ?? null,
		[duration, durationOptions],
	);

	const columns = useMemo(() => getCycleColumns(), []);

	useEffect(() => {
		setDurationInput(getDurationDisplayValue(duration));
	}, [duration]);

	if (requireCustomer && !customerId) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center space-y-2">
					<Icon icon="mdi:account-arrow-left" className="text-4xl text-slate-300 mx-auto" />
					<Text variant="body1" className="text-slate-400">
						Select a customer from the sidebar to view cycles
					</Text>
				</div>
			</div>
		);
	}

	return (
		<div className={`flex w-full flex-col gap-4 ${isLoading ? "opacity-60 pointer-events-none" : ""}`}>
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
				<div className="flex items-center gap-2">
					<Text variant="body2" className="text-muted-foreground">
						{customerName ? `${customerName} selected` : "Select a customer"}
					</Text>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={() => navigate("/dashboard/coupons/create")}>
						Create Coupons
					</Button>
				</div>
			</div>
			{/* Summary */}
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			{/* Filters: Search + Duration + Status + Date Range */}
			<div className="flex flex-wrap items-center justify gap-2 rounded-lg border p-4">
				<div className="space-y-1.5">
					<Label>Search</Label>
					<Input
						type="text"
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						placeholder="Search customer..."
						className="w-[220px]"
					/>
				</div>

				<div className="space-y-1.5">
					<Label>Duration</Label>
					<Combobox<(typeof durationOptions)[number]>
						items={durationOptions}
						value={selectedDurationOption}
						inputValue={durationInput}
						onValueChange={(option) => {
							const nextDuration = Number(option?.value ?? 0);
							setDurationInput(option?.label ?? ALL_DURATION_LABEL);
							onDurationChange(nextDuration);
						}}
						onInputValueChange={(nextInputValue) => {
							const normalizedInput = normalizeDurationInput(nextInputValue);
							setDurationInput(normalizedInput);
							onDurationChange(
								normalizedInput === "" || normalizedInput === ALL_DURATION_LABEL ? 0 : Number(normalizedInput),
							);
						}}
					>
						<div ref={durationAnchorRef} className="w-[180px]">
							<ComboboxInput className={cn("w-full bg-background")} placeholder="Duration" aria-label="Duration" />
						</div>
						<ComboboxContent anchor={durationAnchorRef}>
							<ComboboxEmpty>No matching duration.</ComboboxEmpty>
							<ComboboxList>{(option) => <ComboboxItem value={option}>{option.label}</ComboboxItem>}</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</div>

				<div className="space-y-1.5">
					<Label>Status</Label>
					<Select value={status} onValueChange={(value) => onStatusChange(value as CycleStatus | "all")}>
						<SelectTrigger className="w-[180px]" aria-label="Status">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							{CYCLE_STATUS_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<Label>From</Label>
					<Input
						type="date"
						value={fromDate}
						max={toDate || undefined}
						onChange={(e) => setFromDate(e.target.value)}
						className="w-[180px]"
					/>
				</div>

				<div className="space-y-1.5">
					<Label>To</Label>
					<Input
						type="date"
						value={toDate}
						min={fromDate || undefined}
						onChange={(e) => setToDate(e.target.value)}
						className="w-[180px]"
					/>
				</div>

				<div className="space-y-1.5">
					<div className="h-2" aria-hidden="true" />
					<Button
						size="sm"
						className="h-8"
						onClick={() => {
							setDurationInput(getDurationDisplayValue(0));
							onResetFilters();
						}}
					>
						Reset Default
					</Button>
				</div>
			</div>

			{/* Cycles Table */}
			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={cycles}
				columns={columns}
				onRowClick={(row) => onSelectCycle(row)}
				paginationConfig={{
					page: currentPage,
					pageSize,
					totalItems,
					totalPages,
					paginationItems,
					onPageChange,
					onPageSizeChange,
				}}
			/>
		</div>
	);
}
