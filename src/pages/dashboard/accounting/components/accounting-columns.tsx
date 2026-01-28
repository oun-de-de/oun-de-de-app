import { createColumnHelper } from "@tanstack/react-table";
import type { AccountingRow } from "@/core/types/common";

const columnHelper = createColumnHelper<AccountingRow>();

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
			<span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{info.getValue()}</span>
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
