import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/ui/badge";
import { getStatusVariant } from "@/core/utils/get-status-variant";

export type BorrowRow = {
	id: string;
	refNo: string;
	borrower: string;
	date: string;
	status: "Active" | "Returned" | "Overdue";
	itemCount: number;
};

export const borrowColumns: ColumnDef<BorrowRow>[] = [
	{ accessorKey: "refNo", header: "Ref No" },
	{ accessorKey: "borrower", header: "Borrower" },
	{ accessorKey: "date", header: "Date" },
	{ accessorKey: "itemCount", header: "Items" },
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ getValue }) => {
			const status = getValue() as string;
			const variant = getStatusVariant(status);
			return (
				<Badge variant={variant} shape="square">
					{status}
				</Badge>
			);
		},
	},
];
