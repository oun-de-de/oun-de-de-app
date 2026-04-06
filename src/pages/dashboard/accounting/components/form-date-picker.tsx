import { CalendarIcon, CalendarDays } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import {
	Controller,
	type Control,
	type FieldPath,
	type FieldValues,
	type RegisterOptions,
} from "react-hook-form";
import { Button } from "@/core/ui/button";
import { Calendar } from "@/core/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import { cn } from "@/core/utils";
import { formatDateToYYYYMMDD } from "@/pages/dashboard/accounting/utils/format-local-date-time";

interface FormDatePickerProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	control: Control<TFieldValues>;
	name: TName;
	placeholder?: string;
	error?: string;
	className?: string;
	disabled?: boolean;
	rules?: RegisterOptions<TFieldValues, TName>;
	valueMode?: "date" | "date-string";
	hideError?: boolean;
}

function toDateFromValue(value: string | Date | null | undefined): Date | undefined {
	if (!value) return undefined;
	if (value instanceof Date) return isValid(value) ? value : undefined;
	if (typeof value === "string") {
		const parsed = parseISO(value);
		return isValid(parsed) ? parsed : undefined;
	}
	return undefined;
}

/**
 * A standard Date Picker that works with Date objects or ISO strings.
 * Returns a Date object to the form by default.
 * Self-renders its own error message.
 */
export function FormDatePicker<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	control,
	name,
	placeholder = "Pick a date",
	error,
	className,
	disabled,
	rules,
	valueMode = "date",
	hideError = false,
}: FormDatePickerProps<TFieldValues, TName>) {
	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			render={({ field, fieldState }) => {
				const dateValue = toDateFromValue(field.value);

				return (
					<div className={cn("space-y-2 w-full", className)}>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									type="button"
									variant="outline"
									disabled={disabled}
									ref={field.ref}
									onBlur={field.onBlur}
									aria-invalid={fieldState.invalid || !!error}
									className={cn(
										"h-11 w-full justify-between text-left font-medium text-base border-slate-200 rounded-lg bg-slate-50/50 transition-colors",
										dateValue ? "text-gray-900" : "text-gray-400",
										error && "border-rose-500 ring-rose-500",
									)}
								>
									<div className="flex items-center gap-2">
										<CalendarDays className="size-4 text-slate-400" />
										{dateValue ? format(dateValue, "dd/MM/yyyy") : <span>{placeholder}</span>}
									</div>
									<CalendarIcon className="h-4 w-4 text-slate-400" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={dateValue}
									onSelect={(date) => {
										if (!date) {
											field.onChange(valueMode === "date-string" ? "" : undefined);
											return;
										}
										field.onChange(valueMode === "date-string" ? formatDateToYYYYMMDD(date) : date);
									}}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
						{!hideError && error && (
							<p className="text-rose-500 text-xs font-medium px-1 animate-in fade-in slide-in-from-top-1">{error}</p>
						)}
					</div>
				);
			}}
		/>
	);
}
