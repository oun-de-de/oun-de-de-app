import type { ColumnDef } from "@tanstack/react-table";
import type { Cycle } from "@/core/types/cycle";
import { Badge } from "@/core/ui/badge";

function formatDisplayDate(value: string): string {
	return new Date(value).toLocaleDateString();
}

function getDurationDays(startDate: string, endDate: string): number {
	const start = new Date(startDate);
	const end = new Date(endDate);
	return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function formatAmount(value?: number): string {
	return (value ?? 0).toLocaleString();
}

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
			id: "duration",
			header: "Duration",
			cell: ({ row }) => {
				const days = getDurationDays(row.original.startDate, row.original.endDate);
				return <Badge variant="info">{days} days</Badge>;
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => <Badge variant={getCycleStatusVariant(row.original.status)}>{row.original.status}</Badge>,
			meta: { bodyClassName: "text-center" },
		},
		{
			id: "totalAmount",
			header: "Total Amount",
			cell: ({ row }) => formatAmount(row.original.totalAmount),
			meta: { bodyClassName: "text-right" },
		},
		{
			id: "totalPaidAmount",
			header: "Paid",
			cell: ({ row }) => formatAmount(row.original.totalPaidAmount),
			meta: { bodyClassName: "text-right" },
		},
		{
			id: "balanceAmount",
			header: "Balance",
			cell: ({ row }) => formatAmount((row.original.totalAmount ?? 0) - (row.original.totalPaidAmount ?? 0)),
			meta: { bodyClassName: "text-right" },
		},
	];
}
