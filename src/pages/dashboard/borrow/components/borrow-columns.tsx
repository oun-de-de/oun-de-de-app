import type { ColumnDef } from "@tanstack/react-table";
import type { BorrowerType } from "@/core/types/loan";
import { Badge } from "@/core/ui/badge";

export type BorrowRow = {
	id: string;
	borrowerType: BorrowerType;
	borrowerId: string;
	principalAmount: number;
	termMonths: number;
	monthlyPayment: number;
	startDate: string;
};

export const borrowColumns: ColumnDef<BorrowRow>[] = [
	{ accessorKey: "borrowerId", header: "Borrower ID" },
	{
		accessorKey: "borrowerType",
		size: 100,
		header: "Type",
		cell: ({ row }) => (
			<Badge
				variant={row.original.borrowerType === "employee" ? "info" : "success"}
				shape="square"
				className="capitalize"
			>
				{row.original.borrowerType}
			</Badge>
		),
		meta: {
			bodyClassName: "text-center",
		},
	},
	{ accessorKey: "startDate", header: "Start Date" },
	{
		accessorKey: "principalAmount",
		header: "Principal",
		cell: ({ row }) => row.original.principalAmount.toLocaleString(),
		meta: { bodyClassName: "text-right" },
	},
	{
		accessorKey: "termMonths",
		header: "Term (Months)",
		meta: { bodyClassName: "text-right" },
	},
	{
		accessorKey: "monthlyPayment",
		header: "Monthly Pay",
		cell: ({ row }) => row.original.monthlyPayment.toLocaleString(),
		meta: { bodyClassName: "text-right" },
	},
];
