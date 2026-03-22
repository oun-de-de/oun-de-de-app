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
	DEBIT: "border-sky-200 bg-sky-50 text-sky-700",
	CREDIT: "border-emerald-200 bg-emerald-50 text-emerald-700",
	Cash_Sale: "border-amber-200 bg-amber-50 text-amber-700",
	Revenue: "border-sky-200 bg-sky-50 text-sky-700",
	Receipt: "border-yellow-200 bg-yellow-50 text-yellow-700",
	Expense: "border-cyan-200 bg-cyan-50 text-cyan-700",
	Journal: "border-violet-200 bg-violet-50 text-violet-700",
	Invoice: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const TYPE_DOT_CLASSNAME: Record<string, string> = {
	DEBIT: "bg-sky-500",
	CREDIT: "bg-emerald-500",
	Cash_Sale: "bg-amber-500",
	Revenue: "bg-sky-500",
	Receipt: "bg-yellow-500",
	Expense: "bg-cyan-500",
	Journal: "bg-violet-500",
	Invoice: "bg-emerald-500",
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
		size: 100,
		cell: (info) => {
			const value = info.getValue();

			return (
				<Badge
					className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0 text-[11px] font-semibold shadow-none ${
						TYPE_BADGE_CLASSNAME[value] ?? "border-slate-200 bg-slate-50 text-slate-700"
					}`}
					shape="square"
				>
					<span
						aria-hidden="true"
						className={`h-1.5 w-1.5 rounded-full ${TYPE_DOT_CLASSNAME[value] ?? "bg-slate-400"}`}
					/>
					{formatTypeLabel(value)}
				</Badge>
			);
		},
		meta: {
			bodyClassName: "text-center",
		},
	}),
	columnHelper.accessor("currency", {
		header: "Currency",
		size: 90,
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
