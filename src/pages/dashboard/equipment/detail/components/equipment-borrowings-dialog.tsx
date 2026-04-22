import { CalendarIcon } from "lucide-react";
import { useRef } from "react";
import type { Customer } from "@/core/types/customer";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/core/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/ui/form";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { useInventoryBorrowings } from "../../hooks/use-inventory-items";
import { BorrowingActionDialog } from "./borrowing-action-dialog";
import { BorrowingsHistoryDialog } from "./borrowings-history-dialog";
import { BorrowingsTable } from "./borrowings-table";
import { useEquipmentBorrowingsDialogState } from "../hooks/use-equipment-borrowings-dialog-state";
import {
	formatIsoDateForDisplay,
	toIsoDateValue,
	useEquipmentBorrowingForm,
} from "../hooks/use-equipment-borrowing-form";
import { useDialogOpenState } from "@/core/hooks/use-dialog-open-state";
import { useDialogSubmitHandler } from "@/core/hooks/use-dialog-submit-handler";

type EquipmentBorrowingsDialogProps = {
	itemId: string;
	customers: Customer[];
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

type ExpectedReturnDateInputProps = {
	value: string;
	onChange: (value: string) => void;
};

function ExpectedReturnDateInput({ value, onChange }: ExpectedReturnDateInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleOpenPicker = () => {
		if (typeof inputRef.current?.showPicker === "function") {
			inputRef.current.showPicker();
			return;
		}

		inputRef.current?.focus();
		inputRef.current?.click();
	};

	return (
		<div className="relative">
			<Button
				type="button"
				variant="outline"
				className="h-10 w-full justify-between px-3 text-left font-normal text-slate-700 hover:bg-white"
				onClick={handleOpenPicker}
			>
				<span>{value || "dd/mm/yyyy"}</span>
				<CalendarIcon className="h-4 w-4 text-slate-400" />
			</Button>
			<Input
				ref={inputRef}
				type="date"
				tabIndex={-1}
				value={toIsoDateValue(value)}
				onChange={(event) => onChange(formatIsoDateForDisplay(event.target.value))}
				className="pointer-events-none absolute bottom-0 left-0 h-0 w-0 overflow-hidden border-0 p-0 opacity-0"
				aria-hidden="true"
			/>
		</div>
	);
}

export function EquipmentBorrowingsDialog({
	itemId,
	customers,
	open: controlledOpen,
	onOpenChange,
}: EquipmentBorrowingsDialogProps) {
	const borrowingForm = useEquipmentBorrowingForm(itemId);
	const {
		isHistoryDialogOpen,
		setIsHistoryDialogOpen,
		openHistoryDialog,
		historyPage,
		setHistoryDialogPage,
		historyPageSize,
		setHistoryPageSize,
		pendingAction,
		sellRefCodeMode,
		setSellRefCodeMode,
		sellRefCode,
		setSellRefCode,
		sellExpense,
		setSellExpense,
		isPending,
		returnBorrowing,
		sellBorrowing,
		resetAllDialogs,
		openSellAction,
		openReturnAction,
		closePendingAction,
		confirmPendingAction,
		regenerateSellRefCode,
	} = useEquipmentBorrowingsDialogState(itemId);
	const { data: borrowings = [], isLoading } = useInventoryBorrowings(itemId);
	const previewBorrowings = borrowings.slice(0, 5);
	const dialog = useDialogOpenState({
		open: controlledOpen,
		onOpenChange,
		isDismissDisabled: borrowingForm.isPending || isPending,
		onClose: () => {
			borrowingForm.reset();
			resetAllDialogs();
		},
	});
	const submitAndClose = useDialogSubmitHandler({
		closeDialog: dialog.close,
	});

	return (
		<div className="contents">
			<Dialog open={dialog.open} onOpenChange={dialog.onOpenChange}>
				<DialogTrigger asChild>
					<Button size="sm" variant="warning" className="gap-1">
						Borrowings
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-7xl">
					<DialogHeader>
						<DialogTitle>Equipment Borrowings</DialogTitle>
					</DialogHeader>

					<Form {...borrowingForm.form}>
						<form
							id="equipment-borrowing-form"
							onSubmit={borrowingForm.form.handleSubmit((values) => submitAndClose(() => borrowingForm.submit(values)))}
							className="space-y-4"
						>
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
								<FormField
									control={borrowingForm.form.control}
									name="customerId"
									render={({ field }) => (
										<FormItem className="space-y-2 md:col-span-2">
											<FormLabel>Customer</FormLabel>
											<Select value={field.value} onValueChange={field.onChange}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select customer…" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{customers.map((customer) => (
														<SelectItem key={customer.id} value={customer.id}>
															{customer.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={borrowingForm.form.control}
									name="quantity"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel>Quantity</FormLabel>
											<FormControl>
												<Input type="number" min={1} className="h-10" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={borrowingForm.form.control}
									name="expectedReturnDate"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel>Expected Return Date</FormLabel>
											<FormControl>
												<ExpectedReturnDateInput value={field.value} onChange={field.onChange} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={borrowingForm.form.control}
								name="memo"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel>Memo</FormLabel>
										<FormControl>
											<Textarea {...field} placeholder="Additional notes…" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter>
								<Button type="submit" form="equipment-borrowing-form" disabled={borrowingForm.isPending}>
									{borrowingForm.isPending ? "Saving…" : "Create Borrowing"}
								</Button>
							</DialogFooter>
						</form>
					</Form>

					<div className="space-y-2">
						<div className="flex items-center justify-between gap-2">
							<Label className="text-sm font-semibold">Borrowing History</Label>
							{borrowings.length > previewBorrowings.length && (
								<Button size="sm" variant="secondary" onClick={openHistoryDialog}>
									View More
								</Button>
							)}
						</div>
						<BorrowingsTable
							borrowings={previewBorrowings}
							className="max-h-[320px]"
							maxBodyHeight="320px"
							onSell={(borrowingId) => {
								const borrowing = previewBorrowings.find((item) => item.id === borrowingId);
								if (!borrowing) return;
								openSellAction(borrowingId, borrowing.customerName);
							}}
							onReturn={(borrowingId) => {
								const borrowing = previewBorrowings.find((item) => item.id === borrowingId);
								if (!borrowing) return;
								openReturnAction(borrowingId, borrowing.customerName);
							}}
							isSellPending={sellBorrowing.isPending}
							isReturnPending={returnBorrowing.isPending}
						/>
						{isLoading && <p className="text-xs text-slate-500">Loading borrowings…</p>}
					</div>
				</DialogContent>
			</Dialog>

			<BorrowingsHistoryDialog
				open={isHistoryDialogOpen}
				onOpenChange={setIsHistoryDialogOpen}
				borrowings={borrowings}
				page={historyPage}
				pageSize={historyPageSize}
				onPageChange={setHistoryDialogPage}
				onPageSizeChange={(pageSize) => {
					setHistoryPageSize(pageSize);
					setHistoryDialogPage(1);
				}}
				onSell={(borrowingId) => {
					const borrowing = borrowings.find((item) => item.id === borrowingId);
					if (!borrowing) return;
					openSellAction(borrowingId, borrowing.customerName);
				}}
				onReturn={(borrowingId) => {
					const borrowing = borrowings.find((item) => item.id === borrowingId);
					if (!borrowing) return;
					openReturnAction(borrowingId, borrowing.customerName);
				}}
				isSellPending={sellBorrowing.isPending}
				isReturnPending={returnBorrowing.isPending}
			/>

			<BorrowingActionDialog
				pendingAction={pendingAction}
				sellRefCodeMode={sellRefCodeMode}
				onSellRefCodeModeChange={(value) => {
					setSellRefCodeMode(value);
					if (value === "auto") {
						regenerateSellRefCode();
					}
				}}
				sellRefCode={sellRefCode}
				onSellRefCodeChange={setSellRefCode}
				onRegenerateSellRefCode={regenerateSellRefCode}
				sellExpense={sellExpense}
				onSellExpenseChange={setSellExpense}
				onConfirm={confirmPendingAction}
				onCancel={closePendingAction}
				isPending={isPending}
			/>
		</div>
	);
}
