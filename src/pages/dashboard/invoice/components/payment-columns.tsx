import type { ColumnDef } from "@tanstack/react-table";
import type { CyclePayment } from "@/core/types/cycle";
import { formatDisplayDate, formatNumber } from "../utils/formatters";

export const PAYMENT_COLUMNS: ColumnDef<CyclePayment>[] = [
	{
		accessorKey: "paymentDate",
		header: "Date",
		cell: ({ row }) => formatDisplayDate(row.original.paymentDate),
	},
	{
		accessorKey: "id",
		header: "Ref No",
		cell: ({ row }) => row.original.id.slice(0, 8),
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => formatNumber(row.original.amount),
		meta: { bodyClassName: "text-right" },
	},
];
