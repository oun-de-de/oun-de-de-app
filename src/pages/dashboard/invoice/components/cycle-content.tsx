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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CYCLE_STATUS_OPTIONS, DURATION_OPTIONS } from "../constants/constants";
import { useCycleTable } from "../hooks/use-cycle-table";
import { getCycleColumns } from "./cycle-columns";

type CycleContentProps = {
	customerId: string | null;
	customerName: string | null;
	onSelectCycle: (cycle: Cycle) => void;
	requireCustomer?: boolean;
	initialDuration?: number | null;
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

export function CycleContent({
	customerId,
	customerName,
	onSelectCycle,
	requireCustomer = false,
	initialDuration,
}: CycleContentProps) {
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
	} = useCycleTable(customerId, requireCustomer, initialDuration);

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
	const handleResetDefault = useCallback(() => {
		setDurationInput(getDurationDisplayValue(0));
		onResetFilters();
	}, [onResetFilters]);
	const handleRowClick = useCallback((row: Cycle) => onSelectCycle(row), [onSelectCycle]);
	const paginationConfig = useMemo(
		() => ({
			page: currentPage,
			pageSize,
			totalItems,
			totalPages,
			paginationItems,
			onPageChange,
			onPageSizeChange,
		}),
		[currentPage, onPageChange, onPageSizeChange, pageSize, paginationItems, totalItems, totalPages],
	);

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
		<div
			className={`flex h-full min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden ${isLoading ? "opacity-60 pointer-events-none" : ""}`}
		>
			{/* Header */}
			<div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
				<div className="flex items-center gap-2">
					<Text variant="body2" className="text-muted-foreground">
						{customerName ? `Cycles for ${customerName}` : "Select a customer"}
					</Text>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={() => navigate("/dashboard/coupons/create")}>
						Create Coupons
					</Button>
				</div>
			</div>
			{/* Summary */}
			<div className="shrink-0 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			{/* Filters: Search + Duration + Status + Date Range */}
			<div className="shrink-0 rounded-lg border p-4">
				<div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-[minmax(360px,1.45fr)_minmax(210px,0.85fr)_minmax(210px,0.85fr)]">
					<div className="space-y-1.5">
						<Label>Search</Label>
						<Input
							type="text"
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							placeholder="Search customer..."
							className="w-full"
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
							<div ref={durationAnchorRef} className="w-full">
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
							<SelectTrigger className="w-full" aria-label="Status">
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

					<div className="grid grid-cols-1 gap-3 md:col-span-3 md:grid-cols-[170px_170px_auto] md:justify-start">
						<div className="space-y-1.5">
							<Label>From</Label>
							<Input
								type="date"
								value={fromDate}
								max={toDate || undefined}
								onChange={(e) => setFromDate(e.target.value)}
								className="w-full md:w-[170px]"
							/>
						</div>

						<div className="space-y-1.5">
							<Label>To</Label>
							<Input
								type="date"
								value={toDate}
								min={fromDate || undefined}
								onChange={(e) => setToDate(e.target.value)}
								className="w-full md:w-[170px]"
							/>
						</div>

						<div className="flex items-end justify-start">
							<Button size="sm" className="h-8" onClick={handleResetDefault}>
								Reset Default
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Cycles Table */}
			<SmartDataTable
				className="flex-1 min-h-0 w-full overflow-hidden"
				maxBodyHeight="100%"
				minBodyHeight="0"
				data={cycles}
				columns={columns}
				onRowClick={handleRowClick}
				paginationConfig={paginationConfig}
			/>
		</div>
	);
}
