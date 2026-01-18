import { createColumnHelper } from "@tanstack/react-table";
import type { AuditLogRow } from "@/core/types/common";
import { Button } from "@/core/ui/button";

const columnHelper = createColumnHelper<AuditLogRow>();

export const columns = [
	columnHelper.accessor("date", {
		header: "Date",
		cell: (info) => <span className="text-slate-500">{info.getValue()}</span>,
	}),
	columnHelper.accessor("user", {
		header: "User",
	}),
	columnHelper.accessor("event", {
		header: "Event",
	}),
	columnHelper.display({
		id: "history",
		header: "History",
		cell: () => (
			<Button variant="link" className="h-auto p-0 text-sky-600">
				View
			</Button>
		),
	}),
];
