import { CalendarIcon, CalendarDays } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Controller, type Control, type FieldValues, type FieldPath } from "react-hook-form";
import { Button } from "@/core/ui/button";
import { Calendar } from "@/core/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import { cn } from "@/core/utils";

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
}

/**
 * Helper to ensure we have a valid Date object regardless of whether the form holds a Date or an ISO string.
 * Strictly typed to avoid 'any'.
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
}: FormDatePickerProps<TFieldValues, TName>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => {
				const dateValue = toDateFromValue(field.value);

				/**
				 * IMPORTANT: Since we store dates as UTC midnight (T00:00:00.000Z), rendering them with
				 * local-time functions (like format or new Date() components) would cause a shift
				 * for users in non-UTC timezones.
				 *
				 * To fix this, we create a 'displayDate' that effectively treats the UTC parts
				 * as local parts for the purpose of the UI components.
				 */
				const displayDate = dateValue
					? new Date(dateValue.getUTCFullYear(), dateValue.getUTCMonth(), dateValue.getUTCDate())
					: undefined;

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
										displayDate ? "text-gray-900" : "text-gray-400",
										error && "border-rose-500 ring-rose-500",
									)}
								>
									<div className="flex items-center gap-2">
										<CalendarDays className="size-4 text-slate-400" />
										{displayDate ? format(displayDate, "dd/MM/yyyy") : <span>{placeholder}</span>}
									</div>
									<CalendarIcon className="h-4 w-4 text-slate-400" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={displayDate}
									onSelect={(date) => {
										if (!date) {
											field.onChange(undefined);
											return;
										}
										// Convert local date selection back to UTC at midnight for storage
										const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
										field.onChange(utcDate);
									}}
									initialFocus
								/>
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
