import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/core/utils/index";
import { buttonVariants } from "@/core/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("py-2 flex flex-col items-center", className)}
			classNames={{
				root: "w-full flex flex-col items-center",
				months: "flex flex-col sm:flex-row gap-2 justify-center",
				month: "flex flex-col gap-3 items-center",
				caption: "flex items-center justify-center w-full pb-2",
				caption_label: "hidden",
				caption_dropdowns: "flex items-center pl-2 justify-center",
				dropdown:
					"h-9 rounded border border-gray-300 bg-white px-1 mr-2 text-sm font-medium text-black outline-none focus:[box-shadow:var(--ids-sem-ring-focus)] focus-visible:[box-shadow:var(--ids-sem-ring-focus)] disabled:cursor-not-allowed disabled:opacity-50",
				dropdown_month: "min-w-[120px]",
				dropdown_year: "min-w-[100px]",
				nav: "flex items-center gap-1",
				nav_button: cn(
					buttonVariants({ variant: "outline" }),
					"size-7 bg-white text-black border-blue-100 p-0 opacity-80 hover:opacity-100 hover:border-blue-200 hover:bg-blue-50",
				),
				nav_button_previous: "absolute left-1",
				nav_button_next: "absolute right-1",
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
				day: cn(buttonVariants({ variant: "ghost" }), "size-8 p-0 font-normal aria-selected:opacity-100 text-black"),
				day_range_start: "day-range-start aria-selected:bg-blue-500 aria-selected:text-white",
				day_range_end: "day-range-end aria-selected:bg-blue-500 aria-selected:text-white",
				day_selected: "bg-blue-500 text-white hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white",
				day_today: "text-blue-600 border border-blue-200 bg-blue-50",
				day_outside: "day-outside text-gray-300 aria-selected:text-gray-300",
				day_disabled: "text-gray-300 opacity-50",
				day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-600",
				day_hidden: "invisible",
				...classNames,
			}}
			components={{
				IconLeft: ({ className, ...props }) => <ChevronLeft className={cn("size-4", className)} {...props} />,
				IconRight: ({ className, ...props }) => <ChevronRight className={cn("size-4", className)} {...props} />,
			}}
			{...props}
		/>
	);
}

export { Calendar };
