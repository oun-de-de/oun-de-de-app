import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Customer } from "@/core/types/customer";
import type { SellEquipmentRequest } from "@/core/types/inventory";
import { Button } from "@/core/ui/button";
import { Calendar } from "@/core/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatDisplayDate } from "@/core/utils/formatters";
import { useInventoryBorrowings } from "../../hooks/use-inventory-items";
import { useCreateBorrowing, useReturnBorrowing, useSellBorrowing } from "../../hooks/use-inventory-mutations";
import { BorrowingsTable } from "./borrowings-table";
import { Textarea } from "@/core/ui/textarea";

type EquipmentBorrowingsDialogProps = {
	itemId: string;
	customers: Customer[];
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

type PendingBorrowingAction =
	| { type: "sell"; borrowingId: string; customerName: string }
	| { type: "return"; borrowingId: string; customerName: string }
	| null;

function toLocalMidnightDateTime(dateValue: string): string {
	return `${dateValue}T00:00:00`;
}

function parseLocalDate(value: string): Date | undefined {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function formatDateForValue(date: Date): string {
	return format(date, "yyyy-MM-dd");
}

export function EquipmentBorrowingsDialog({
	itemId,
	customers,
	open: controlledOpen,
	onOpenChange,
}: EquipmentBorrowingsDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [customerId, setCustomerId] = useState("");
	const [quantity, setQuantity] = useState("1");
	const [expectedReturnDate, setExpectedReturnDate] = useState("");
	const [memo, setMemo] = useState("");
	const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
	const [historyPage, setHistoryDialogPage] = useState(1);
	const [historyPageSize, setHistoryPageSize] = useState(20);
	const [pendingAction, setPendingAction] = useState<PendingBorrowingAction>(null);
	const [sellRefCode, setSellRefCode] = useState("");
	const [sellExpense, setSellExpense] = useState("");

	const { data: borrowings = [], isLoading } = useInventoryBorrowings(itemId);
	const createBorrowing = useCreateBorrowing(itemId);
	const returnBorrowing = useReturnBorrowing(itemId);
	const sellBorrowing = useSellBorrowing(itemId);
	const isControlled = onOpenChange !== undefined;
	const open = isControlled ? (controlledOpen ?? false) : internalOpen;
	const setOpen = (nextOpen: boolean) => {
		if (isControlled) {
			onOpenChange?.(nextOpen);
			return;
		}
		setInternalOpen(nextOpen);
	};
	const previewBorrowings = borrowings.slice(0, 5);
	const totalHistoryPages = Math.max(1, Math.ceil(borrowings.length / historyPageSize));
	const pagedBorrowings = borrowings.slice((historyPage - 1) * historyPageSize, historyPage * historyPageSize);
	const selectedExpectedReturnDate = useMemo(() => parseLocalDate(expectedReturnDate), [expectedReturnDate]);
	const resetBorrowingForm = useCallback(() => {
		setCustomerId("");
		setQuantity("1");
		setExpectedReturnDate("");
		setMemo("");
	}, []);
	const resetSellForm = useCallback(() => {
		setSellRefCode("");
		setSellExpense("");
	}, []);
	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				resetBorrowingForm();
				resetSellForm();
				setPendingAction(null);
			}
			setOpen(nextOpen);
		},
		[resetBorrowingForm, resetSellForm],
	);
	const handleConfirmPendingAction = useCallback(() => {
		if (!pendingAction) return;

		if (pendingAction.type === "sell") {
			const refCode = sellRefCode.trim();
			if (!refCode) {
				toast.error("Reference code is required");
				return;
			}

			const parsedExpense = sellExpense.trim() === "" ? undefined : Number(sellExpense);
			if (parsedExpense !== undefined && (!Number.isFinite(parsedExpense) || parsedExpense < 0)) {
				toast.error("Expense must be 0 or greater");
				return;
			}

			const data: SellEquipmentRequest = {
				refCode,
				...(parsedExpense !== undefined ? { expense: parsedExpense } : {}),
			};

			sellBorrowing.mutate(
				{ borrowingId: pendingAction.borrowingId, data },
				{
					onSuccess: () => {
						resetSellForm();
						setPendingAction(null);
					},
				},
			);
			return;
		}

		returnBorrowing.mutate(pendingAction.borrowingId, {
			onSuccess: () => {
				resetSellForm();
				setPendingAction(null);
			},
		});
	}, [pendingAction, returnBorrowing, sellBorrowing, sellRefCode, sellExpense, resetSellForm]);

	const handleSellBorrowing = useCallback(
		(borrowingId: string, customerName: string) => {
			resetSellForm();
			setPendingAction({
				type: "sell",
				borrowingId,
				customerName,
			});
		},
		[resetSellForm],
	);

	const handleReturnBorrowing = useCallback(
		(borrowingId: string, customerName: string) => {
			resetSellForm();
			setPendingAction({
				type: "return",
				borrowingId,
				customerName,
			});
		},
		[resetSellForm],
	);

	const handleCreateBorrowing = () => {
		const parsedQty = Number(quantity);
		if (!customerId) {
			toast.error("Please select customer");
			return;
		}
		if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
			toast.error("Quantity must be greater than 0");
			return;
		}
		if (!expectedReturnDate) {
			toast.error("Expected return date is required");
			return;
		}
		const normalizedExpectedReturnDate = toLocalMidnightDateTime(expectedReturnDate);

		createBorrowing.mutate(
			{
				customerId,
				quantity: parsedQty,
				expectedReturnDate: normalizedExpectedReturnDate,
				memo,
			},
			{
				onSuccess: () => {
					handleOpenChange(false);
				},
			},
		);
	};

	return (
		<div className="contents">
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<Button size="sm" variant="warning" className="gap-1">
						Borrowings
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-7xl">
					<DialogHeader>
						<DialogTitle>Equipment Borrowings</DialogTitle>
					</DialogHeader>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div className="space-y-2 md:col-span-2">
							<Label>Customer</Label>
							<Select value={customerId} onValueChange={setCustomerId}>
								<SelectTrigger>
									<SelectValue placeholder="Select customer…" />
								</SelectTrigger>
								<SelectContent>
									{customers.map((customer) => (
										<SelectItem key={customer.id} value={customer.id}>
											{customer.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Quantity</Label>
							<Input
								type="number"
								min={1}
								className="h-10"
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label>Expected Return Date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="outline"
										className="h-10 w-full justify-between px-3 text-slate-500 hover:bg-white"
									>
										<span>{expectedReturnDate ? formatDisplayDate(expectedReturnDate) : "Select date"}</span>
										<CalendarIcon className="h-4 w-4 text-slate-400" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={selectedExpectedReturnDate}
										onSelect={(date) => setExpectedReturnDate(date ? formatDateForValue(date) : "")}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<div className="space-y-2">
						<Label>Memo</Label>
						<Textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Additional notes…" />
					</div>

					<DialogFooter>
						<Button onClick={handleCreateBorrowing} disabled={createBorrowing.isPending}>
							{createBorrowing.isPending ? "Saving…" : "Create Borrowing"}
						</Button>
					</DialogFooter>

					<div className="space-y-2">
						<div className="flex items-center justify-between gap-2">
							<Label className="text-sm font-semibold">Borrowing History</Label>
							{borrowings.length > previewBorrowings.length && (
								<Button
									size="sm"
									variant="secondary"
									onClick={() => {
										setHistoryDialogPage(1);
										setIsHistoryDialogOpen(true);
									}}
								>
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
								handleSellBorrowing(borrowingId, borrowing.customerName);
							}}
							onReturn={(borrowingId) => {
								const borrowing = previewBorrowings.find((item) => item.id === borrowingId);
								if (!borrowing) return;
								handleReturnBorrowing(borrowingId, borrowing.customerName);
							}}
							isSellPending={sellBorrowing.isPending}
							isReturnPending={returnBorrowing.isPending}
						/>
						{isLoading && <p className="text-xs text-slate-500">Loading borrowings…</p>}
					</div>
				</DialogContent>
			</Dialog>
			<Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
				<DialogContent className="sm:max-w-6xl">
					<DialogHeader>
						<DialogTitle>Borrowing History</DialogTitle>
					</DialogHeader>
					<BorrowingsTable
						borrowings={pagedBorrowings}
						className="rounded-md border border-slate-200 pb-2"
						maxBodyHeight="60vh"
						onSell={(borrowingId) => {
							const borrowing = pagedBorrowings.find((item) => item.id === borrowingId);
							if (!borrowing) return;
							handleSellBorrowing(borrowingId, borrowing.customerName);
						}}
						onReturn={(borrowingId) => {
							const borrowing = pagedBorrowings.find((item) => item.id === borrowingId);
							if (!borrowing) return;
							handleReturnBorrowing(borrowingId, borrowing.customerName);
						}}
						isSellPending={sellBorrowing.isPending}
						isReturnPending={returnBorrowing.isPending}
						paginationConfig={{
							page: historyPage,
							pageSize: historyPageSize,
							totalItems: borrowings.length,
							totalPages: totalHistoryPages,
							paginationItems: Array.from({ length: totalHistoryPages }, (_, index) => index + 1),
							onPageChange: setHistoryDialogPage,
							onPageSizeChange: (pageSize) => {
								setHistoryPageSize(pageSize);
								setHistoryDialogPage(1);
							},
						}}
					/>
				</DialogContent>
			</Dialog>
			<Dialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{pendingAction?.type === "sell" ? "Confirm Sale" : "Confirm Return"}</DialogTitle>
						<DialogDescription>
							{pendingAction?.type === "sell"
								? `Mark this borrowing for ${pendingAction.customerName} as sold?`
								: `Mark this borrowing for ${pendingAction?.customerName} as returned?`}
						</DialogDescription>
					</DialogHeader>
					{pendingAction?.type === "sell" ? (
						<div className="grid grid-cols-1 gap-3">
							<div className="space-y-2">
								<Label htmlFor="sell-ref-code">Reference Code</Label>
								<Input
									id="sell-ref-code"
									value={sellRefCode}
									onChange={(event) => setSellRefCode(event.target.value)}
									placeholder="Enter sale reference code"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="sell-expense">Expense</Label>
								<Input
									id="sell-expense"
									type="number"
									min={0}
									step="0.01"
									value={sellExpense}
									onChange={(event) => setSellExpense(event.target.value)}
									placeholder="Optional selling expense"
								/>
							</div>
						</div>
					) : null}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								resetSellForm();
								setPendingAction(null);
							}}
							disabled={sellBorrowing.isPending || returnBorrowing.isPending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleConfirmPendingAction}
							disabled={sellBorrowing.isPending || returnBorrowing.isPending}
						>
							{sellBorrowing.isPending || returnBorrowing.isPending ? "Saving…" : "Confirm"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
