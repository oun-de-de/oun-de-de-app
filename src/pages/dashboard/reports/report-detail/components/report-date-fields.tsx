import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/ui/button";
import { Calendar } from "@/core/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatDateToYYYYMMDD } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import { FilterRow } from "./report-search-combobox";
import { formatFilterDateForDisplay } from "./report-table-utils";

export const MONTH_OPTIONS = [
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

export function parseReportFilterDate(value?: string) {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return undefined;
	}
	return date;
}

export function parseMonthFilterValue(value?: string) {
	if (!value) return { year: "", month: "" };
	const [year, month] = value.split("-");
	return {
		year: /^\d{4}$/.test(year ?? "") ? year : "",
		month: /^(0[1-9]|1[0-2])$/.test(month ?? "") ? month : "",
	};
}

export type ReportDatePickerButtonProps = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	className?: string;
};

export function ReportDatePickerButton({ id, value, onChange, className }: ReportDatePickerButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const selectedDate = parseReportFilterDate(value);
	const displayValue = selectedDate ? formatFilterDateForDisplay(value) : "Select date";

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					className={className ?? "h-10 justify-between px-3 text-slate-500 hover:bg-white"}
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
						if (!date) return;
						onChange(formatDateToYYYYMMDD(date));
						setIsOpen(false);
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}

export type ReportMonthFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

export function ReportMonthField({ value, onChange }: ReportMonthFieldProps) {
	const { year, month } = parseMonthFilterValue(value);
	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 8 }, (_, index) => String(currentYear - index));

	const updateValue = (nextYear: string, nextMonth: string) => {
		onChange(`${nextYear || ""}-${nextMonth || ""}`);
	};

	return (
		<div className="flex flex-col gap-1.5">
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

export type RabbitReportPeriodFieldProps = {
	fromDate: string;
	toDate: string;
	onFromDateChange: (value: string) => void;
	onToDateChange: (value: string) => void;
};

export function RabbitReportPeriodField({
	fromDate,
	toDate,
	onFromDateChange,
	onToDateChange,
}: RabbitReportPeriodFieldProps) {
	return (
		<FilterRow label="Report Period" required>
			<div className="flex h-10 items-stretch overflow-hidden rounded-md border border-slate-200 bg-white">
				<div className="flex w-10 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400">
					<CalendarIcon className="h-4 w-4" />
				</div>
				<ReportDatePickerButton
					id="report-period-from"
					value={fromDate}
					onChange={onFromDateChange}
					className="h-10 flex-1 justify-start rounded-none border-0 px-3 text-slate-500 shadow-none hover:bg-white"
				/>
				<div className="flex items-center px-2 text-slate-400">-</div>
				<ReportDatePickerButton
					id="report-period-to"
					value={toDate}
					onChange={onToDateChange}
					className="h-10 flex-1 justify-start rounded-none border-0 px-3 text-slate-500 shadow-none hover:bg-white"
				/>
			</div>
		</FilterRow>
	);
}
