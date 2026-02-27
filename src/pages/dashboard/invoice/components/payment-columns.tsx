import type { CyclePayment } from "@/core/types/cycle";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDisplayDateTime, formatKHR } from "../utils/formatters";

export const PAYMENT_COLUMNS: ColumnDef<CyclePayment>[] = [
	{
		accessorKey: "paymentDate",
		header: "Date",
		cell: ({ row }) => formatDisplayDateTime(row.original.paymentDate),
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => formatKHR(row.original.amount),
		meta: { bodyClassName: "text-right" },
	},
];
