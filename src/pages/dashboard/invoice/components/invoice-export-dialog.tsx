import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/core/ui/button";
import { Calendar } from "@/core/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import { cn } from "@/core/utils";
import { formatDisplayDate } from "@/core/utils/formatters";

interface InvoiceExportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onExport: (range: { from: Date; to: Date }) => void;
	isExporting?: boolean;
}

export function InvoiceExportDialog({ open, onOpenChange, onExport, isExporting }: InvoiceExportDialogProps) {
	const [dateRange, setDateRange] = useState<DateRange | undefined>();

	const handleExport = () => {
		if (dateRange?.from && dateRange?.to) {
			onExport({ from: dateRange.from, to: dateRange.to });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Export Invoices</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									id="date"
									variant={"outline"}
									className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? (
										dateRange.to ? (
											<>
												{formatDisplayDate(dateRange.from.toISOString())} -{" "}
												{formatDisplayDate(dateRange.to.toISOString())}
											</>
										) : (
											formatDisplayDate(dateRange.from.toISOString())
										)
									) : (
										<span>Pick a date range</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									initialFocus
									mode="range"
									defaultMonth={dateRange?.from}
									selected={dateRange}
									onSelect={setDateRange}
									numberOfMonths={2}
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
						Cancel
					</Button>
					<Button onClick={handleExport} disabled={!dateRange?.from || !dateRange?.to || isExporting}>
						{isExporting ? "Exporting..." : "Export"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
