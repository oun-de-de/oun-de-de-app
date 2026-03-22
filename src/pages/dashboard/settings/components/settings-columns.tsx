import type { CellContext, ColumnDef } from "@tanstack/react-table";
import Icon from "@/core/components/icon/icon";
import type { SettingsRow } from "@/core/types/common";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { getSettingsActions } from "../stores";

const TYPE_BADGE_VARIANT: Record<string, "default" | "info" | "success" | "warning" | "secondary"> = {
	count: "info",
	weight: "success",
	volume: "warning",
	length: "secondary",
};

export const getColumnsForItem = (activeItem: string, canEdit = true): ColumnDef<SettingsRow>[] => {
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
			cell: ({ row }) =>
				canEdit ? (
					<Button
						variant="linkSecondary"
						className="h-auto p-0 font-normal text-sky-600"
						onClick={() => getSettingsActions().openEditForm(row.original)}
					>
						{row.original.name}
					</Button>
				) : (
					<span>{row.original.name}</span>
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
			...(canEdit
				? [
						{
							id: "actions",
							size: 30,
							cell: (cellContext: CellContext<SettingsRow, unknown>) => {
								const { row } = cellContext;
								return (
									<Button
										variant="ghost"
										size="sm"
										className="cursor-pointer"
										onClick={() => getSettingsActions().openEditForm(row.original)}
									>
										<Icon icon="mdi:pencil" className="h-4 w-4" />
									</Button>
								);
							},
						},
					]
				: []),
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
			...(canEdit
				? [
						{
							id: "actions",
							size: 40,
							cell: (cellContext: CellContext<SettingsRow, unknown>) => {
								const { row } = cellContext;
								return (
									<Button
										variant="ghost"
										size="icon"
										className="cursor-pointer"
										onClick={() => getSettingsActions().openEditForm(row.original)}
									>
										<Icon icon="mdi:pencil" className="h-4 w-4" />
									</Button>
								);
							},
						},
					]
				: []),
		];
	}

	if (activeItem === "Currency") {
		return [
			...baseColumns,
			{
				header: "Description",
				accessorKey: "descr",
				meta: { bodyClassName: "text-gray-600" },
			},
		];
	}

	if (activeItem === "Chart of Accounts") {
		return [
			{
				id: "no",
				header: "No",
				size: 50,
				meta: { bodyClassName: "text-center", headerClassName: "text-center" },
				cell: ({ row }) => row.index + 1,
			},
			{
				header: "Code",
				accessorKey: "code",
				meta: { bodyClassName: "text-slate-700 text-center font-medium" },
			},
			{
				header: "Name",
				accessorKey: "name",
				meta: { bodyClassName: "text-sky-600 text-center" },
			},
			{
				header: "Description",
				accessorKey: "descr",
				meta: { bodyClassName: "text-gray-600" },
			},
			{
				header: "Account Type",
				accessorKey: "type",
				meta: { bodyClassName: "text-center" },
			},
		];
	}

	if (activeItem === "Account Type") {
		return [
			{
				id: "no",
				header: "No",
				size: 50,
				meta: { bodyClassName: "text-center", headerClassName: "text-center" },
				cell: ({ row }) => row.index + 1,
			},
			{
				header: "Code",
				accessorKey: "code",
				meta: { bodyClassName: "text-slate-700 text-center font-medium" },
			},
			{
				header: "Name",
				accessorKey: "name",
				meta: { bodyClassName: "text-sky-600 text-center" },
			},
			{
				header: "Nature",
				accessorKey: "type",
				meta: { bodyClassName: "text-center" },
				cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
			},
			{
				header: "Description",
				accessorKey: "descr",
				meta: { bodyClassName: "text-gray-600" },
			},
		];
	}

	if (activeItem === "Journal Type" || activeItem === "Journal Class") {
		return [
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
			},
			{
				header: "Description",
				accessorKey: "descr",
				meta: { bodyClassName: "text-gray-600" },
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
		...(canEdit
			? [
					{
						id: "actions",
						header: "",
						cell: (cellContext: CellContext<SettingsRow, unknown>) => {
							const { row } = cellContext;
							return (
								<Button
									variant="ghost"
									size="sm"
									className="cursor-pointer"
									onClick={() => getSettingsActions().openEditForm(row.original)}
								>
									<Icon icon="mdi:pencil" className="h-4 w-4" />
								</Button>
							);
						},
						meta: { headerClassName: "w-12" },
					},
				]
			: []),
	];
};

export const columns = getColumnsForItem("default");
