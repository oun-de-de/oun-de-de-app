import { createColumnHelper } from "@tanstack/react-table";
import type { AccountingRow } from "@/core/types/common";
import { Badge } from "@/core/ui/badge";

const columnHelper = createColumnHelper<AccountingRow>();

const TYPE_BADGE_CLASSNAME: Record<string, string> = {
	Cash_Sale: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
	Revenue: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
	Receipt: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200",
	Expense: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
	Journal: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
	Invoice: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

export const columns = [
	columnHelper.accessor("date", {
		header: "Date",
		cell: (info) => <span>{info.getValue()}</span>,
	}),
	columnHelper.accessor("refNo", {
		header: "Ref No.",
		cell: (info) => <span className="text-sky-600">{info.getValue()}</span>,
	}),
	columnHelper.accessor("type", {
		header: "Type",
		cell: (info) => (
			<Badge className={TYPE_BADGE_CLASSNAME[info.getValue()] ?? "bg-slate-100 text-slate-700"}>
				{info.getValue()}
			</Badge>
		),
	}),
	columnHelper.accessor("currency", {
		header: "Currency",
	}),
	columnHelper.accessor("memo", {
		header: "Memo",
		cell: (info) => <span className="text-slate-500">{info.getValue() || "-"}</span>,
	}),
	columnHelper.accessor("dr", {
		header: "DR",
		meta: {
			headerClassName: "text-right",
			bodyClassName: "text-right",
		},
	}),
	columnHelper.accessor("cr", {
		header: "CR",
		meta: {
			headerClassName: "text-right",
			bodyClassName: "text-right font-semibold",
		},
	}),
];
