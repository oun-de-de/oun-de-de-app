import { CalendarIcon, CalendarDays, Clock } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Controller, type Control, type FieldValues, type FieldPath } from "react-hook-form";
import { Button } from "@/core/ui/button";
import { Calendar } from "@/core/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import { Input } from "@/core/ui/input";
import { cn } from "@/core/utils";

import { formatDateTimeLocalInputValue } from "../utils/format-local-date-time";

interface FormDateTimeLocalPickerProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	control: Control<TFieldValues>;
	name: TName;
	placeholder?: string;
	error?: string;
	className?: string;
	disabled?: boolean;
}

/**
 * Helper to ensure we have a valid Date object regardless of whether the form holds a Date or an ISO string.
 */
function toDateFromValue(value: string | Date | null | undefined): Date | undefined {
	if (!value) return undefined;
	if (value instanceof Date) return value;
	if (typeof value === "string") {
		const parsed = parseISO(value);
		return isValid(parsed) ? parsed : undefined;
	}
	return undefined;
}

/**
 * A specialized Picker for datetime-local strings (YYYY-MM-DDTHH:mm).
 * Returns a formatted string to the form.
 * Self-renders its own error message.
 */
export function FormDateTimeLocalPicker<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	control,
	name,
	placeholder = "Pick date & time",
	error,
	className,
	disabled,
}: FormDateTimeLocalPickerProps<TFieldValues, TName>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => {
				const dateValue = toDateFromValue(field.value);

				const handleValueChange = (newDate: Date) => {
					field.onChange(formatDateTimeLocalInputValue(newDate));
				};

				return (
					<div className={cn("space-y-2 w-full", className)}>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									type="button"
									variant="outline"
									disabled={disabled}
									className={cn(
										"h-11 w-full justify-between text-left font-medium text-base border-slate-200 rounded-lg bg-slate-50/50 transition-colors",
										dateValue ? "text-gray-900" : "text-gray-400",
										error && "border-rose-500 ring-rose-500",
									)}
								>
									<div className="flex items-center gap-2">
										<CalendarDays className="size-4 text-slate-400" />
										{dateValue ? format(dateValue, "dd/MM/yyyy HH:mm") : <span>{placeholder}</span>}
									</div>
									<CalendarIcon className="h-4 w-4 text-slate-400" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0 flex flex-col sm:flex-row" align="start">
								<div className="p-3 border-r border-slate-100">
									<Calendar
										mode="single"
										selected={dateValue}
										onSelect={(date) => {
											if (!date) return;
											const current = dateValue || new Date();
											const newDate = new Date(date);
											newDate.setHours(current.getHours(), current.getMinutes(), 0, 0);
											handleValueChange(newDate);
										}}
										initialFocus
									/>
								</div>
								<div className="p-4 w-full sm:w-48 bg-slate-50/50">
									<div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
										<Clock className="size-3" />
										Time selection
									</div>
									<Input
										type="time"
										className="h-10 bg-white border-slate-200"
										value={dateValue ? format(dateValue, "HH:mm") : ""}
										onChange={(e) => {
											const timeStr = e.target.value;

											// If the time is cleared: only update if a date is already selected
											if (!timeStr) {
												if (!dateValue) return;
												const resetDate = new Date(dateValue);
												resetDate.setHours(0, 0, 0, 0);
												handleValueChange(resetDate);
												return;
											}

											// If valid time string is entered
											const [hours, minutes] = timeStr.split(":").map(Number);
											if (isNaN(hours) || isNaN(minutes)) return;

											const updateDate = new Date(dateValue || new Date());
											updateDate.setHours(hours, minutes, 0, 0);
											handleValueChange(updateDate);
										}}
									/>
									<div className="mt-4 text-[11px] text-slate-400 leading-relaxed italic">
										Select a date on the left then adjust the time above.
									</div>
								</div>
							</PopoverContent>
						</Popover>
						{error && (
							<p className="text-rose-500 text-xs font-medium px-1 animate-in fade-in slide-in-from-top-1">{error}</p>
						)}
					</div>
				);
			}}
		/>
	);
}
