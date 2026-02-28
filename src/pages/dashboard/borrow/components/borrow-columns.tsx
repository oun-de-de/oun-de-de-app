import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import type { Loan } from "@/core/types/loan";
import { Badge } from "@/core/ui/badge";

export const borrowColumns: ColumnDef<Loan>[] = [
	{ accessorKey: "borrowerName", header: "Borrower Name" },
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
	{
		accessorKey: "startDate",
		header: "Start Date",
		cell: ({ row }) => format(parseISO(row.original.startDate), "yyyy-MM-dd"),
	},
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
