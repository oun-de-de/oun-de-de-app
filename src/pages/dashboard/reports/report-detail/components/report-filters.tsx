import customerService from "@/core/api/services/customer-service";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Calendar } from "@/core/ui/calendar";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatDateToYYYYMMDD } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import type { ReportFilterConfig } from "../report-types";
import { formatFilterDateForDisplay } from "./report-table-utils";

export type ReportFiltersValue = {
	customerId: string;
	fromDate: string;
	toDate: string;
	useDateRange: boolean;
};

type ReportFiltersProps = {
	value: ReportFiltersValue;
	onChange: (value: ReportFiltersValue) => void;
	onSubmit: () => void;
	onReset: () => void;
	hasPendingChanges: boolean;
	filterConfig: ReportFilterConfig;
};

function parseReportFilterDate(value?: string) {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return undefined;
	}
	return date;
}

type ReportDateFieldProps = {
	id: string;
	label: string;
	value: string;
	required?: boolean;
	onChange: (value: string) => void;
};

function ReportDateField({ id, label, value, required, onChange }: ReportDateFieldProps) {
	const selectedDate = parseReportFilterDate(value);
	const displayValue = selectedDate ? formatFilterDateForDisplay(value) : "Select date";

	return (
		<div className="flex flex-col gap-1.5 text-red-500">
			<Label htmlFor={id} className="text-slate-600">
				{required ? "*" : null} {label}
			</Label>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id={id}
						type="button"
						variant="outline"
						className="h-10 justify-between px-3 text-slate-500 hover:bg-white"
					>
						<span>{displayValue}</span>
						<CalendarIcon className="h-4 w-4 text-slate-400" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={(date) => {
							onChange(date ? formatDateToYYYYMMDD(date) : "");
						}}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export const ReportFilters = React.memo(function ReportFilters({
	value,
	onChange,
	onSubmit,
	onReset,
	hasPendingChanges,
	filterConfig,
}: ReportFiltersProps) {
	const { customerId, fromDate, toDate, useDateRange } = value;
	const { data: customersResponse } = useQuery({
		queryKey: ["report", "customer-list", "all"],
		queryFn: () => customerService.getCustomerList({ limit: 10000 }),
		enabled: filterConfig.customer,
	});
	const customers = customersResponse?.list ?? [];
	const hasCustomerAndDateRange = filterConfig.customer && filterConfig.dateRange;
	const hasDateFilter = filterConfig.dateRange || filterConfig.singleDate || filterConfig.monthOnly;
	const helperSpanClass = hasCustomerAndDateRange || hasDateFilter ? "lg:col-span-2" : "lg:col-span-1";

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{filterConfig.customer && (
				<div className={hasCustomerAndDateRange ? "lg:col-span-2 flex flex-col gap-1.5" : "flex flex-col gap-1.5"}>
					<Label htmlFor="customer" className="text-slate-600">
						Customer
					</Label>
					<Select
						value={customerId}
						onValueChange={(nextCustomerId) => {
							onChange({
								customerId: nextCustomerId,
								fromDate,
								toDate,
								useDateRange,
							});
						}}
					>
						<SelectTrigger id="customer" className="h-10 text-slate-500">
							<SelectValue placeholder="Select customer" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							{customers.map((customer) => (
								<SelectItem key={customer.id} value={customer.id}>
									{customer.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{filterConfig.dateRange && (
				<ReportDateField
					id="report-date-from"
					label="From"
					required
					value={fromDate}
					onChange={(nextFromDate) => onChange({ customerId, fromDate: nextFromDate, toDate, useDateRange: true })}
				/>
			)}

			{filterConfig.dateRange && (
				<ReportDateField
					id="report-date-to"
					label="To"
					required
					value={toDate}
					onChange={(nextToDate) => onChange({ customerId, fromDate, toDate: nextToDate, useDateRange: true })}
				/>
			)}

			{filterConfig.singleDate && (
				<ReportDateField
					id="report-date"
					label="Date"
					required
					value={fromDate}
					onChange={(nextDate) =>
						onChange({
							customerId,
							fromDate: nextDate,
							toDate: nextDate,
							useDateRange: true,
						})
					}
				/>
			)}

			{filterConfig.monthOnly && (
				<div className="flex flex-col gap-1.5 text-red-500">
					<Label htmlFor="report-month" className="text-slate-600">
						* Month
					</Label>
					<Input
						id="report-month"
						type="month"
						value={fromDate}
						onChange={(e) =>
							onChange({
								customerId,
								fromDate: e.target.value,
								toDate: e.target.value,
								useDateRange: true,
							})
						}
						className="h-10 text-slate-500"
					/>
				</div>
			)}

			<div className={`${helperSpanClass} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
				<p
					className={
						hasPendingChanges
							? "rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700"
							: "text-sm text-slate-500"
					}
				>
					{hasPendingChanges ? "Filter changes are not applied yet." : "Displayed data matches the current filters."}
				</p>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" className="h-10 px-6" onClick={onReset} disabled={!hasPendingChanges}>
						Reset
					</Button>
					<Button
						type="button"
						className="h-10 bg-sky-500 px-9 hover:bg-sky-600"
						onClick={onSubmit}
						disabled={!hasPendingChanges}
					>
						Submit
					</Button>
				</div>
			</div>
		</div>
	);
});
