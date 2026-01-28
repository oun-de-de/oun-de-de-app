import type { ColumnDef } from "@tanstack/react-table";
import Icon from "@/core/components/icon/icon";
import type { SettingsRow } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { getSettingsSidebarActions } from "../stores";

export const columns: ColumnDef<SettingsRow>[] = [
	{
		header: "Name",
		accessorKey: "name",
		meta: { bodyClassName: "text-sky-600" },
		cell: ({ row }) => (
			<Button
				variant="linkSecondary"
				className="h-auto p-0 font-normal text-sky-600"
				onClick={() => getSettingsSidebarActions().openEditForm(row.original)}
			>
				{row.original.name}
			</Button>
		),
	},
	{
		header: "Type",
		accessorKey: "type",
		accessorFn: (row) => row.type || "System",
		meta: { bodyClassName: "text-gray-600" },
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => (
			<Button
				variant="ghost"
				size="sm"
				className="cursor-pointer"
				onClick={() => getSettingsSidebarActions().openEditForm(row.original)}
			>
				<Icon icon="mdi:pencil" className="h-4 w-4" />
			</Button>
		),
		meta: { headerClassName: "w-12" },
	},
];
