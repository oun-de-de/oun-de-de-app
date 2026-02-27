import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { SmartDataTable } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { InventoryBorrowing } from "@/core/types/inventory";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";

type BorrowingsTableProps = {
	borrowings: InventoryBorrowing[];
	onReturn: (borrowingId: string) => void;
	onPay: (customerId: string) => void;
	isReturnPending?: boolean;
};

export function BorrowingsTable({ borrowings, onReturn, onPay, isReturnPending }: BorrowingsTableProps) {
	const columns = useMemo<ColumnDef<InventoryBorrowing>[]>(
		() => [
			{
				accessorKey: "borrowDate",
				header: "Borrow Date",
				cell: ({ row }) => new Date(row.original.borrowDate).toLocaleDateString(),
			},
			{
				accessorKey: "customerId",
				header: "Customer ID",
				cell: ({ row }) => <span className="font-mono text-xs">{row.original.customerId.slice(0, 8)}</span>,
			},
			{ accessorKey: "quantity", header: "Quantity" },
			{
				accessorKey: "expectedReturnDate",
				header: "Expected Return",
				cell: ({ row }) => new Date(row.original.expectedReturnDate).toLocaleDateString(),
			},
			{
				accessorKey: "actualReturnDate",
				header: "Actual Return",
				cell: ({ row }) =>
					row.original.actualReturnDate ? new Date(row.original.actualReturnDate).toLocaleDateString() : "-",
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
					row.original.status === "BORROWED" ? (
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" onClick={() => onPay(row.original.customerId)}>
								<Icon icon="mdi:cash" className="mr-1" />
								Pay
							</Button>
							<Button variant="outline" size="sm" onClick={() => onReturn(row.original.id)} disabled={isReturnPending}>
								<Icon icon="mdi:keyboard-return" className="mr-1" />
								{isReturnPending ? "..." : "Return"}
							</Button>
						</div>
					) : (
						<span className="text-slate-400 text-xs">Returned</span>
					),
			},
		],
		[onPay, onReturn, isReturnPending],
	);

	if (borrowings.length === 0) {
		return (
			<div className="flex items-center justify-center py-12 text-slate-400">
				<Text variant="body2">No borrowings found</Text>
			</div>
		);
	}

	return <SmartDataTable className="flex-1 min-h-0" maxBodyHeight="100%" data={borrowings} columns={columns} />;
}
