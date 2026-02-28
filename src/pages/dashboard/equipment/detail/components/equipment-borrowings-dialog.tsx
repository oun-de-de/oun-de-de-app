import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SmartDataTable } from "@/core/components/common";
import type { Customer } from "@/core/types/customer";
import type { InventoryBorrowing } from "@/core/types/inventory";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { useInventoryBorrowings } from "../../hooks/use-inventory-items";
import { useCreateBorrowing, useReturnBorrowing } from "../../hooks/use-inventory-mutations";

type EquipmentBorrowingsDialogProps = {
	itemId: string;
	customers: Customer[];
};

export function EquipmentBorrowingsDialog({ itemId, customers }: EquipmentBorrowingsDialogProps) {
	const [customerId, setCustomerId] = useState("");
	const [quantity, setQuantity] = useState("1");
	const [expectedReturnDate, setExpectedReturnDate] = useState("");
	const [memo, setMemo] = useState("");

	const { data: borrowings = [], isLoading } = useInventoryBorrowings(itemId);
	const createBorrowing = useCreateBorrowing(itemId);
	const returnBorrowing = useReturnBorrowing(itemId);

	const columns = useMemo<ColumnDef<InventoryBorrowing>[]>(
		() => [
			{
				accessorKey: "borrowDate",
				header: "Borrow Date",
				cell: ({ row }) => new Date(row.original.borrowDate).toLocaleDateString(),
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
				cell: ({ row }) => new Date(row.original.expectedReturnDate).toLocaleDateString(),
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge variant={row.original.status === "BORROWED" ? "warning" : "success"}>{row.original.status}</Badge>
				),
			},
			{
				id: "action",
				header: "Action",
				cell: ({ row }) =>
					row.original.status === "BORROWED" && (
						<Button
							variant="secondary"
							className="text-xs"
							onClick={() => returnBorrowing.mutate(row.original.id)}
							disabled={returnBorrowing.isPending}
						>
							Return
						</Button>
					),
			},
		],
		[returnBorrowing],
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
					setQuantity("1");
					setCustomerId("");
					setExpectedReturnDate("");
					setMemo("");
				},
			},
		);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" variant="secondary">
					Borrowings
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-7xl">
				<DialogHeader>
					<DialogTitle>Equipment Borrowings</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div className="space-y-2 md:col-span-2">
						<Label>Customer</Label>
						<Select value={customerId} onValueChange={setCustomerId}>
							<SelectTrigger>
								<SelectValue placeholder="Select customer" />
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
					<Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Additional notes" />
				</div>

				<DialogFooter>
					<Button onClick={handleCreateBorrowing} disabled={createBorrowing.isPending}>
						{createBorrowing.isPending ? "Saving..." : "Create Borrowing"}
					</Button>
				</DialogFooter>

				<div className="space-y-2">
					<Label className="text-sm font-semibold">Borrowing History</Label>
					<SmartDataTable className="max-h-[320px]" maxBodyHeight="320px" data={borrowings} columns={columns} />
					{isLoading && <p className="text-xs text-slate-500">Loading borrowings...</p>}
				</div>
			</DialogContent>
		</Dialog>
	);
}
