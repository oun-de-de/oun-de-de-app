import type { ColumnDef } from "@tanstack/react-table";
import type { Cycle } from "@/core/types/cycle";
import { Badge } from "@/core/ui/badge";
import { formatDisplayDate, formatNumber } from "../utils/formatters";

function getCycleStatusVariant(status: Cycle["status"]): "success" | "warning" | "error" {
	switch (status) {
		case "CLOSED":
			return "success";
		case "OPEN":
			return "warning";
		case "OVERDUE":
			return "error";
	}
}

export function getCycleColumns(): ColumnDef<Cycle>[] {
	return [
		{
			header: "No",
			size: 60,
			cell: ({ row, table }) => {
				const { pageIndex, pageSize } = table.getState().pagination;
				return pageIndex * pageSize + row.index + 1;
			},
			meta: { bodyClassName: "text-center" },
		},
		{
			accessorKey: "customerName",
			header: "Customer",
			cell: ({ row }) => <span className="font-medium text-sky-600">{row.original.customerName}</span>,
		},
		{
			accessorKey: "startDate",
			header: "Start Date",
			cell: ({ row }) => formatDisplayDate(row.original.startDate),
		},
		{
			accessorKey: "endDate",
			header: "End Date",
			cell: ({ row }) => formatDisplayDate(row.original.endDate),
		},
		{
			accessorKey: "status",
			header: "Status",
			size: 100,
			cell: ({ row }) => <Badge variant={getCycleStatusVariant(row.original.status)}>{row.original.status}</Badge>,
			meta: { bodyClassName: "text-center" },
		},
		{
			id: "totalAmount",
			header: "Total Amount",
			cell: ({ row }) => formatNumber(row.original.totalAmount),
			meta: { bodyClassName: "text-right" },
		},
		{
			id: "totalPaidAmount",
			header: "Paid",
			cell: ({ row }) => formatNumber(row.original.totalPaidAmount),
			meta: { bodyClassName: "text-right" },
		},
		{
			id: "balanceAmount",
			header: "Balance",
			cell: ({ row }) => formatNumber((row.original.totalAmount ?? 0) - (row.original.totalPaidAmount ?? 0)),
			meta: { bodyClassName: "text-right" },
		},
	];
}
