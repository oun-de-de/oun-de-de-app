import type { ColumnDef } from "@tanstack/react-table";
import type { Loan } from "@/core/types/loan";
import { Badge } from "@/core/ui/badge";
import { formatDisplayDate, formatKHR } from "@/core/utils/formatters";

function getLoanStatusLabel(status: Loan["status"]) {
	if (status === "due") return "Due";
	if (status === "complete") return "Complete";
	return "Normal";
}

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
		accessorKey: "status",
		size: 100,
		header: "Status",
		cell: ({ row }) => (
			<Badge
				variant={
					row.original.status === "complete" ? "success" : row.original.status === "due" ? "destructive" : "success"
				}
				shape="square"
			>
				{getLoanStatusLabel(row.original.status)}
			</Badge>
		),
		meta: {
			bodyClassName: "text-center",
		},
	},
	{
		accessorKey: "startDate",
		header: "Start Date",
		cell: ({ row }) => formatDisplayDate(row.original.startDate),
	},
	{
		accessorKey: "principalAmount",
		header: "Principal",
		cell: ({ row }) => formatKHR(row.original.principalAmount),
		meta: { bodyClassName: "text-right" },
	},
	{
		accessorKey: "memo",
		header: "Memo",
		cell: ({ row }) => {
			const memo = row.original.memo?.trim();
			return memo ? (
				<span className="block max-w-64 truncate" title={memo}>
					{memo}
				</span>
			) : (
				"-"
			);
		},
	},
	{
		id: "remainingBalance",
		header: "Remaining Balance",
		cell: ({ row }) => formatKHR(Math.max(row.original.principalAmount - row.original.paidAmount, 0)),
		meta: { bodyClassName: "text-right" },
	},
	// {
	// 	accessorKey: "monthlyPayment",
	// 	header: "Monthly Pay",
	// 	cell: ({ row }) => formatKHR(row.original.monthlyPayment),
	// 	meta: { bodyClassName: "text-right" },
	// },
];
