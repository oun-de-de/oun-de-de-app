import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { SmartDataTable } from "@/core/components/common";
import type { Customer } from "@/core/types/customer";
import type { InventoryBorrowing } from "@/core/types/inventory";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatDisplayDate } from "@/core/utils/formatters";
import { useInventoryBorrowings } from "../../hooks/use-inventory-items";
import { useCreateBorrowing, useReturnBorrowing, useSellBorrowing } from "../../hooks/use-inventory-mutations";

function getBorrowingStatusVariant(status: InventoryBorrowing["status"]) {
	if (status === "BORROWED") return "warning" as const;
	if (status === "SOLD") return "destructive" as const;
	return "success" as const;
}

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
	const resetBorrowingForm = useCallback(() => {
		setCustomerId("");
		setQuantity("1");
		setExpectedReturnDate("");
		setMemo("");
	}, []);
	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				resetBorrowingForm();
				setPendingAction(null);
			}
			setOpen(nextOpen);
		},
		[resetBorrowingForm],
	);
	const handleConfirmPendingAction = useCallback(() => {
		if (!pendingAction) return;

		const mutation = pendingAction.type === "sell" ? sellBorrowing : returnBorrowing;

		mutation.mutate(pendingAction.borrowingId, {
			onSuccess: () => {
				setPendingAction(null);
			},
		});
	}, [pendingAction, returnBorrowing, sellBorrowing]);

	const columns = useMemo<ColumnDef<InventoryBorrowing>[]>(
		() => [
			{
				accessorKey: "borrowDate",
				header: "Borrow Date",
				cell: ({ row }) => formatDisplayDate(row.original.borrowDate),
			},
			{
				accessorKey: "customerName",
				header: "Customer",
				cell: ({ row }) => row.original.customerName,
			},
			{ accessorKey: "quantity", header: "Quantity" },
			{
				accessorKey: "expectedReturnDate",
				header: "Expected Return",
				cell: ({ row }) => formatDisplayDate(row.original.expectedReturnDate),
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge variant={getBorrowingStatusVariant(row.original.status)}>{row.original.status}</Badge>
				),
			},
			{
				id: "action",
				header: "Action",
				cell: ({ row }) =>
					row.original.status === "BORROWED" && (
						<div className="flex items-center gap-2">
							<Button
								variant="secondary"
								className="text-xs"
								onClick={() =>
									setPendingAction({
										type: "sell",
										borrowingId: row.original.id,
										customerName: row.original.customerName,
									})
								}
								disabled={sellBorrowing.isPending || returnBorrowing.isPending}
							>
								Sell
							</Button>
							<Button
								variant="secondary"
								className="text-xs"
								onClick={() =>
									setPendingAction({
										type: "return",
										borrowingId: row.original.id,
										customerName: row.original.customerName,
									})
								}
								disabled={returnBorrowing.isPending || sellBorrowing.isPending}
							>
								Return
							</Button>
						</div>
					),
			},
		],
		[returnBorrowing.isPending, sellBorrowing.isPending],
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
		const normalizedExpectedReturnDate = new Date(`${expectedReturnDate}T00:00:00.000Z`).toISOString();

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
						<div className="space-y-1">
							<Label>Quantity</Label>
							<Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>Expected Return Date</Label>
							<Input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} />
						</div>
					</div>

					<div className="space-y-2">
						<Label>Memo</Label>
						<Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Additional notes…" />
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
						<SmartDataTable
							className="max-h-[320px]"
							maxBodyHeight="320px"
							data={previewBorrowings}
							columns={columns}
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
					<SmartDataTable
						className="rounded-md border border-slate-200 pb-2"
						maxBodyHeight="60vh"
						data={pagedBorrowings}
						columns={columns}
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
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setPendingAction(null)}
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
