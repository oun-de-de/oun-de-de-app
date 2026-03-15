import type { ColumnDef } from "@tanstack/react-table";
import type { CashTransaction } from "@/core/types/cash-transaction";
import { formatNumber } from "@/core/utils/formatters";

const formatAmount = (value: number) => (value > 0 ? formatNumber(value, "-") : "-");
const formatAccountingCenterDate = (value?: string | null) => value?.trim() || "-";

export const accountingCenterColumns: ColumnDef<CashTransaction>[] = [
	{
		header: "Date",
		accessorKey: "date",
		size: 110,
		cell: ({ row }) => formatAccountingCenterDate(row.original.date),
	},
	{
		header: "Ref No",
		accessorKey: "refNo",
		size: 170,
		cell: ({ row }) => <span className="font-medium text-sky-600">{row.original.refNo}</span>,
	},
	{
		header: "Type",
		accessorKey: "type",
		size: 110,
		cell: ({ row }) => (
			<span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">{row.original.type}</span>
		),
		meta: {
			bodyClassName: "text-center",
		},
	},
	{
		header: "Name",
		accessorKey: "counterpartyName",
	},
	{
		header: "Memo",
		accessorKey: "memo",
	},
	{
		header: "Debit",
		accessorKey: "debit",
		size: 130,
		cell: ({ row }) => <span className="font-semibold text-emerald-600">{formatAmount(row.original.debit)}</span>,
		meta: { headerClassName: "text-right", bodyClassName: "text-right" },
	},
	{
		header: "Credit",
		accessorKey: "credit",
		size: 130,
		cell: ({ row }) => <span className="font-semibold text-rose-600">{formatAmount(row.original.credit)}</span>,
		meta: { headerClassName: "text-right", bodyClassName: "text-right" },
	},
	{
		header: "Balance",
		accessorKey: "balance",
		size: 150,
		cell: ({ row }) => <span className="font-semibold text-slate-700">{formatNumber(row.original.balance, "-")}</span>,
		meta: { headerClassName: "text-right", bodyClassName: "text-right" },
	},
];
