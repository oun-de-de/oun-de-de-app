import { createColumnHelper } from "@tanstack/react-table";
import type { AccountingRow } from "@/core/types/common";
import { AccountingReasonBadge } from "./accounting-badges";

const columnHelper = createColumnHelper<AccountingRow>();

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
	columnHelper.accessor("reason", {
		header: "Reason",
		size: 130,
		cell: (info) => {
			const value = info.getValue() || "-";
			return <AccountingReasonBadge value={value} />;
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
		header: "DEBIT",
		meta: {
			headerClassName: "text-right",
			bodyClassName: "text-right",
		},
	}),
	columnHelper.accessor("cr", {
		header: "CREDIT",
		meta: {
			headerClassName: "text-right",
			bodyClassName: "text-right",
		},
	}),
];
