import customerService from "@/core/api/services/customer-service";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Calendar } from "@/core/ui/calendar";
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

const MONTH_OPTIONS = [
	{ value: "01", label: "January" },
	{ value: "02", label: "February" },
	{ value: "03", label: "March" },
	{ value: "04", label: "April" },
	{ value: "05", label: "May" },
	{ value: "06", label: "June" },
	{ value: "07", label: "July" },
	{ value: "08", label: "August" },
	{ value: "09", label: "September" },
	{ value: "10", label: "October" },
	{ value: "11", label: "November" },
	{ value: "12", label: "December" },
] as const;

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

function parseMonthFilterValue(value?: string) {
	const match = value?.match(/^(\d{4})-(\d{2})$/);
	if (!match) return { year: "", month: "" };
	return { year: match[1], month: match[2] };
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

type ReportMonthFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

function ReportMonthField({ value, onChange }: ReportMonthFieldProps) {
	const { year, month } = parseMonthFilterValue(value);
	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 8 }, (_, index) => String(currentYear - index));

	const updateValue = (nextYear: string, nextMonth: string) => {
		if (!nextYear || !nextMonth) {
			onChange("");
			return;
		}

		onChange(`${nextYear}-${nextMonth}`);
	};

	return (
		<div className="flex flex-col gap-1.5">
			<Label className="text-slate-600">* Month</Label>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<Select value={month} onValueChange={(nextMonth) => updateValue(year, nextMonth)}>
					<SelectTrigger className="h-10 text-slate-500">
						<SelectValue placeholder="Select month" />
					</SelectTrigger>
					<SelectContent>
						{MONTH_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={year} onValueChange={(nextYear) => updateValue(nextYear, month)}>
					<SelectTrigger className="h-10 text-slate-500">
						<SelectValue placeholder="Select year" />
					</SelectTrigger>
					<SelectContent>
						{yearOptions.map((option) => (
							<SelectItem key={option} value={option}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
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
				<ReportMonthField
					value={fromDate}
					onChange={(nextMonth) =>
						onChange({
							customerId,
							fromDate: nextMonth,
							toDate: nextMonth,
							useDateRange: true,
						})
					}
				/>
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
