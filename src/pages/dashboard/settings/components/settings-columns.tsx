import type { ColumnDef } from "@tanstack/react-table";
import type { SettingsRow } from "@/core/types/common";

export const columns: ColumnDef<SettingsRow>[] = [
	{
		header: "Name",
		accessorKey: "name",
		meta: { className: "text-sky-600" },
	},
	{
		header: "Type",
		accessorKey: "type",
		accessorFn: (row) => row.type || "System", // Handle missing type in mock
		meta: { className: "text-gray-600" },
	},
];
