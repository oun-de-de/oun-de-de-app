import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import Icon from "@/core/components/icon/icon";
import { SmartDataTable } from "@/core/components/common";
import type { SmartTablePaginationConfig } from "@/core/components/common/smart-data-table";
import type { InventoryBorrowing } from "@/core/types/inventory";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/core/ui/dropdown-menu";
import { Text } from "@/core/ui/typography";
import { formatDisplayDate } from "@/core/utils/formatters";

function getBorrowingStatusVariant(status: InventoryBorrowing["status"]) {
	if (status === "BORROWED") return "warning" as const;
	if (status === "SOLD") return "destructive" as const;
	return "success" as const;
}

type BorrowingsTableProps = {
	borrowings: InventoryBorrowing[];
	onReturn: (borrowingId: string) => void;
	onSell: (borrowingId: string) => void;
	onPay?: (customerId: string) => void;
	isReturnPending?: boolean;
	isSellPending?: boolean;
	className?: string;
	maxBodyHeight?: string;
	paginationConfig?: SmartTablePaginationConfig;
};

export function BorrowingsTable({
	borrowings,
	onReturn,
	onSell,
	onPay,
	isReturnPending,
	isSellPending,
	className,
	maxBodyHeight,
	paginationConfig,
}: BorrowingsTableProps) {
	const columns = useMemo<ColumnDef<InventoryBorrowing>[]>(
		() => [
			{
				accessorKey: "borrowDate",
				header: "Borrow Date",
				cell: ({ row }) => formatDisplayDate(row.original.borrowDate),
			},
			// {
			// 	accessorKey: "customerId",
			// 	header: "Customer ID",
			// 	cell: ({ row }) => (
			// 		<span className="font-mono text-xs">{row.original.customerId ? row.original.customerId.slice(0, 8) : "-"}</span>
			// 	),
			// },
			{
				accessorKey: "customerName",
				header: "Customer Name",
				cell: ({ row }) => row.original.customerName || "-",
			},
			{
				accessorKey: "expectedReturnDate",
				header: "Expected Return",
				cell: ({ row }) => formatDisplayDate(row.original.expectedReturnDate),
			},
			{
				accessorKey: "actualReturnDate",
				header: "Actual Return",
				cell: ({ row }) => (row.original.actualReturnDate ? formatDisplayDate(row.original.actualReturnDate) : "-"),
			},
			{ accessorKey: "quantity", header: "Quantity", size: 90, meta: { bodyClassName: "text-right" } },
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
				size: 50,
				cell: ({ row }) =>
					row.original.status === "BORROWED" ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="linkSecondary" size="icon">
									<Icon icon="mdi:menu" className="text-base" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="min-w-36">
								{(() => {
									const customerId = row.original.customerId;
									return onPay && customerId ? (
										<DropdownMenuItem onClick={() => onPay(customerId)}>Pay</DropdownMenuItem>
									) : null;
								})()}
								<DropdownMenuItem onClick={() => onSell(row.original.id)} disabled={isSellPending}>
									{isSellPending ? "Selling..." : "Sell"}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => onReturn(row.original.id)} disabled={isReturnPending}>
									{isReturnPending ? "Returning..." : "Return"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<span className="sr-only">{row.original.status}</span>
					),
			},
		],
		[onPay, onReturn, onSell, isReturnPending, isSellPending],
	);

	if (borrowings.length === 0) {
		return (
			<div className="flex items-center justify-center py-12 text-slate-400">
				<Text variant="body2">No borrowings found</Text>
			</div>
		);
	}

	return (
		<SmartDataTable
			className={className ?? "flex-1 min-h-0"}
			maxBodyHeight={maxBodyHeight ?? "100%"}
			data={borrowings}
			columns={columns}
			paginationConfig={paginationConfig}
		/>
	);
}
