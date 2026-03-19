import { createColumnHelper } from "@tanstack/react-table";
import type { AccountingRow } from "@/core/types/common";
import { Badge } from "@/core/ui/badge";

const columnHelper = createColumnHelper<AccountingRow>();

const formatTypeLabel = (value: string) =>
	value
		.replace(/_/g, " ")
		.split(" ")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join(" ");

const TYPE_BADGE_CLASSNAME: Record<string, string> = {
	Cash_Sale: "border border-amber-200 bg-amber-50 text-amber-700",
	Revenue: "border border-sky-200 bg-sky-50 text-sky-700",
	Receipt: "border border-yellow-200 bg-yellow-50 text-yellow-700",
	Expense: "border border-cyan-200 bg-cyan-50 text-cyan-700",
	Journal: "border border-violet-200 bg-violet-50 text-violet-700",
	Invoice: "border border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const columns = [
	columnHelper.accessor("date", {
		header: "Date",
		size: 110,
		cell: (info) => <span>{info.getValue()}</span>,
	}),
	columnHelper.accessor("refNo", {
		header: "Ref No.",
		size: 170,
		cell: (info) => <span className="text-sky-600">{info.getValue()}</span>,
	}),
	columnHelper.accessor("type", {
		header: "Type",
		cell: (info) => (
			<Badge className={TYPE_BADGE_CLASSNAME[info.getValue()] ?? "border border-slate-200 bg-slate-50 text-slate-700"}>
				{formatTypeLabel(info.getValue())}
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
