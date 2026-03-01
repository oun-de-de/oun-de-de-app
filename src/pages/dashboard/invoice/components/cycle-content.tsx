import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { Cycle } from "@/core/types/cycle";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Text } from "@/core/ui/typography";
import { DURATION_OPTIONS } from "../constants/constants";
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

export function CycleContent({ customerId, customerName, onSelectCycle, requireCustomer = false }: CycleContentProps) {
	const navigate = useNavigate();
	const {
		cycles,
		summaryCards,
		duration,
		onDurationChange,
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

	const columns = useMemo(() => getCycleColumns(), []);

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
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1">
						Cycles
					</Button>
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

			{/* Filters: Duration + Date Range */}
			<div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
				<div className="space-y-1.5">
					<Label>Duration</Label>
					<Input
						className="w-[180px] bg-background"
						value={durationInput}
						placeholder="Duration"
						aria-label="Duration"
						inputMode="numeric"
						list="cycle-duration-options"
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								return;
							}
							if (["e", "E", "+", "-", "."].includes(event.key)) {
								event.preventDefault();
							}
						}}
						onChange={(event) => {
							if (event.target.value === ALL_DURATION_LABEL) {
								setDurationInput(ALL_DURATION_LABEL);
								onDurationChange(0);
								return;
							}
							const sanitizedValue = sanitizeDurationInput(event.target.value);
							setDurationInput(sanitizedValue);
							onDurationChange(sanitizedValue === "" ? 0 : Number(sanitizedValue));
						}}
					/>
					<datalist id="cycle-duration-options">
						<option value={ALL_DURATION_LABEL} />
						{DURATION_OPTIONS.filter((option) => option.value !== "0").map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</datalist>
				</div>

				{/* <div className="space-y-1.5">
					<Label>From</Label>
					<Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
				</div>
				<div className="space-y-1.5">
					<Label>To</Label>
					<Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
				</div> */}
				<Button
					size="sm"
					onClick={() => {
						setDurationInput(getDurationDisplayValue(0));
						onResetFilters();
					}}
				>
					Reset Default
				</Button>
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
