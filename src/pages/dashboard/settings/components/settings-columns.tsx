import type { ColumnDef } from "@tanstack/react-table";
import Icon from "@/core/components/icon/icon";
import type { SettingsRow } from "@/core/types/common";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { getSettingsSidebarActions } from "../stores";

const TYPE_BADGE_VARIANT: Record<string, "default" | "info" | "success" | "warning" | "secondary"> = {
	count: "info",
	weight: "success",
	volume: "warning",
	length: "secondary",
};

export const getColumnsForItem = (activeItem: string): ColumnDef<SettingsRow>[] => {
	const baseColumns: ColumnDef<SettingsRow>[] = [
		{
			id: "no",
			header: "No",
			size: 50,
			meta: { bodyClassName: "text-center", headerClassName: "text-center" },
			cell: ({ row }) => row.index + 1,
		},
		{
			header: "Name",
			accessorKey: "name",
			meta: { bodyClassName: "text-sky-600 text-center" },
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
	];

	if (activeItem === "Warehouse") {
		return [
			...baseColumns,
			{
				header: "Description",
				accessorKey: "descr",
				meta: { bodyClassName: "text-gray-600" },
			},
			{
				header: "Location",
				accessorKey: "location",
				meta: { bodyClassName: "text-gray-600" },
			},
			{
				id: "actions",
				size: 30,
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
			},
		];
	}

	if (activeItem === "Unit") {
		return [
			...baseColumns,
			{
				header: "Description",
				accessorKey: "descr",
				meta: { bodyClassName: "text-gray-600" },
			},
			{
				header: "Type",
				accessorKey: "type",
				meta: { bodyClassName: "text-center" },
				cell: ({ row }) => (
					<Badge variant={TYPE_BADGE_VARIANT[row.original.type] || "default"}>{row.original.type}</Badge>
				),
			},
			{
				id: "actions",
				size: 30,
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
			},
		];
	}

	return [
		...baseColumns,
		{
			header: "Type",
			accessorKey: "type",
			meta: { bodyClassName: "text-center" },
			cell: ({ row }) => (
				<Badge variant={TYPE_BADGE_VARIANT[row.original.type] || "default"}>{row.original.type}</Badge>
			),
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
};

export const columns = getColumnsForItem("default");
