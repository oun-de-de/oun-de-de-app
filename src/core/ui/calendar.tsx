import React, { createContext, useCallback, useState } from "react";
import {
	DayPicker,
	type DayPickerDefaultProps,
	type DayPickerSingleProps,
	type DayPickerMultipleProps,
	type DayPickerRangeProps,
	type DropdownProps,
} from "react-day-picker";
import { cn } from "@/core/utils/index";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./select";
import { buttonVariants } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ContainerContext = createContext<HTMLDivElement | null>(null);

function CustomSelectDropdown(props: DropdownProps) {
	const handleValueChange = (newValue: string) => {
		if (props.onChange) {
			const syntheticEvent = {
				target: {
					value: newValue,
				},
			} as React.ChangeEvent<HTMLSelectElement>;
			props.onChange(syntheticEvent);
		}
	};

	const options = React.Children.toArray(props.children) as React.ReactElement[];

	return (
		<Select value={props.value?.toString()} onValueChange={handleValueChange}>
			<SelectTrigger aria-label={props["aria-label"]}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{options.map((option) => (
						<SelectItem
							key={option.key ?? option.props.value}
							value={option.props.value?.toString()}
							disabled={option.props.disabled}
						>
							{option.props.children}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

type CalendarProps = (DayPickerDefaultProps | DayPickerSingleProps | DayPickerMultipleProps | DayPickerRangeProps) & {
	className?: string;
	classNames?: Record<string, string>;
	showOutsideDays?: boolean;
};

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "dropdown",
	...props
}: CalendarProps & { captionLayout?: "dropdown" | "buttons" | "dropdown-buttons" }) {
	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const handleRef = useCallback((element: HTMLDivElement | null) => {
		setContainer(element);
	}, []);

	return (
		<div ref={handleRef} className="px-2">
			<ContainerContext.Provider value={container}>
				<DayPicker
					showOutsideDays={showOutsideDays}
					captionLayout={captionLayout}
					className={cn("py-2 flex flex-col items-center", className)}
					classNames={{
						root: "w-full flex flex-col items-center",
						months: "flex flex-col sm:flex-row gap-2 justify-center",
						month: "flex flex-col gap-3 items-center",
						caption: "flex items-center justify-center w-full pb-2 gap-3",
						caption_label: "hidden",
						nav: "flex items-center gap-1",
						nav_button: cn(
							buttonVariants({ variant: "outline" }),
							"size-7 bg-white text-black border-blue-100 p-0 opacity-80 hover:opacity-100 hover:border-blue-200 hover:bg-blue-50",
						),
						// dropdown: "flex gap-2",
						caption_dropdowns: "flex gap-1 ml-(-1)",
						table: "w-full border-collapse space-x-1",
						head_row: "flex justify-center",
						head_cell: "text-black rounded-md w-8 font-medium text-[0.8rem]",
						row: "flex w-full mt-2 justify-center",
						cell: cn(
							"relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
							props.mode === "range"
								? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
								: "[&:has([aria-selected])]:rounded-md",
						),
						day: cn(
							buttonVariants({ variant: "ghost" }),
							"size-8 p-0 font-normal aria-selected:opacity-100 text-black",
						),
						day_range_start: "day-range-start aria-selected:bg-blue-500 aria-selected:text-white",
						day_range_end: "day-range-end aria-selected:bg-blue-500 aria-selected:text-white",
						day_selected:
							"bg-blue-500 text-white hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white",
						day_today: "text-blue-600 border border-blue-200 bg-blue-50",
						day_outside: "day-outside text-gray-300 aria-selected:text-gray-300",
						day_disabled: "text-gray-300 opacity-50",
						day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-600",
						day_hidden: "invisible",
						...classNames,
					}}
					components={{
						Dropdown: CustomSelectDropdown,
						IconLeft: ({ className, ...props }) => <ChevronLeft className={cn("size-4", className)} {...props} />,
						IconRight: ({ className, ...props }) => <ChevronRight className={cn("size-4", className)} {...props} />,
					}}
					{...props}
				/>
			</ContainerContext.Provider>
		</div>
	);
}

export { Calendar };
