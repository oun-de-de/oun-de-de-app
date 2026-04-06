import type { ColumnDef } from "@tanstack/react-table";
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

function getNoColumn(): ColumnDef<SettingsRow> {
	return {
		id: "no",
		header: "No",
		size: 50,
		meta: { bodyClassName: "text-center", headerClassName: "text-center" },
		cell: ({ row }) => row.index + 1,
	};
}

function renderTruncatedText(value: string | null | undefined, className = "truncate block") {
	const text = value ?? "";
	return (
		<span className={className} title={text}>
			{text}
		</span>
	);
}

type TruncateColumnOptions = {
	header: string;
	accessorKey: string;
	size: number;
	bodyClassName?: string;
};

function getTruncateColumn({
	header,
	accessorKey,
	size,
	bodyClassName = "text-gray-600 overflow-hidden",
}: TruncateColumnOptions): ColumnDef<SettingsRow> {
	return {
		header,
		accessorKey,
		size,
		meta: { bodyClassName },
		cell: ({ getValue }) => renderTruncatedText(getValue<string>()),
	};
}

type EditActionColumnOptions = {
	size?: number;
	buttonSize?: "sm" | "icon";
	header?: string;
	headerClassName?: string;
};

function getEditActionColumn({
	size,
	buttonSize = "sm",
	header,
	headerClassName,
}: EditActionColumnOptions = {}): ColumnDef<SettingsRow> {
	return {
		id: "actions",
		...(header !== undefined ? { header } : {}),
		...(size !== undefined ? { size } : {}),
		cell: ({ row }) => (
			<Button
				variant="ghost"
				size={buttonSize}
				className="cursor-pointer"
				onClick={() => getSettingsActions().openEditForm(row.original)}
			>
				<Icon icon="mdi:pencil" className="h-4 w-4" />
			</Button>
		),
		...(headerClassName ? { meta: { headerClassName } } : {}),
	};
}

export const getColumnsForItem = (activeItem: string, canEdit = true): ColumnDef<SettingsRow>[] => {
	const baseColumns: ColumnDef<SettingsRow>[] = [
		getNoColumn(),
		{
			header: "Name",
			accessorKey: "name",
			size: 240,
			meta: { bodyClassName: "text-sky-600 font-medium overflow-hidden" },
			cell: ({ row }) => {
				const name = row.original.name;
				return canEdit ? (
					<Button
						variant="linkSecondary"
						className="h-auto p-0 font-medium text-sky-600 w-full justify-start text-left"
						onClick={() => getSettingsActions().openEditForm(row.original)}
						title={name}
					>
						<span className="truncate block w-full">{name}</span>
					</Button>
				) : (
					renderTruncatedText(name, "truncate block w-full text-center")
				);
			},
		},
	];

	if (activeItem === "Warehouse") {
		return [
			...baseColumns,
			getTruncateColumn({ header: "Description", accessorKey: "descr", size: 200 }),
			getTruncateColumn({ header: "Location", accessorKey: "location", size: 180 }),
			...(canEdit ? [getEditActionColumn({ size: 30 })] : []),
		];
	}

	if (activeItem === "Unit") {
		return [
			...baseColumns,
			getTruncateColumn({ header: "Description", accessorKey: "descr", size: 250 }),
			{
				header: "Type",
				accessorKey: "type",
				meta: { bodyClassName: "text-center" },
				cell: ({ row }) => (
					<Badge variant={TYPE_BADGE_VARIANT[row.original.type] || "default"}>{row.original.type}</Badge>
				),
			},
			...(canEdit ? [getEditActionColumn({ size: 40, buttonSize: "icon" })] : []),
		];
	}

	if (activeItem === "Currency") {
		return [...baseColumns, getTruncateColumn({ header: "Description", accessorKey: "descr", size: 400 })];
	}

	if (activeItem === "Supplier") {
		return [
			...baseColumns,
			getTruncateColumn({ header: "Description", accessorKey: "descr", size: 180 }),
			getTruncateColumn({ header: "Address", accessorKey: "address", size: 200 }),
			{
				header: "Telephone",
				accessorKey: "telephone",
				size: 140,
				meta: { bodyClassName: "text-gray-600" },
			},
			...(canEdit ? [getEditActionColumn({ size: 40, buttonSize: "icon" })] : []),
		];
	}

	if (activeItem === "Chart of Accounts") {
		return [
			getNoColumn(),
			{
				header: "Code",
				accessorKey: "code",
				meta: { bodyClassName: "text-slate-700 text-center font-medium" },
			},
			getTruncateColumn({
				header: "Name",
				accessorKey: "name",
				size: 200,
				bodyClassName: "text-sky-600 font-medium overflow-hidden",
			}),
			getTruncateColumn({ header: "Description", accessorKey: "descr", size: 250 }),
			{
				header: "Account Type",
				accessorKey: "type",
				size: 150,
				meta: { bodyClassName: "text-center" },
			},
		];
	}

	if (activeItem === "Account Type") {
		return [
			getNoColumn(),
			{
				header: "Code",
				accessorKey: "code",
				meta: { bodyClassName: "text-slate-700 text-center font-medium" },
			},
			getTruncateColumn({
				header: "Name",
				accessorKey: "name",
				size: 200,
				bodyClassName: "text-sky-600 font-medium overflow-hidden",
			}),
			{
				header: "Nature",
				accessorKey: "type",
				size: 100,
				meta: { bodyClassName: "text-center" },
				cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
			},
			getTruncateColumn({ header: "Description", accessorKey: "descr", size: 250 }),
		];
	}

	if (activeItem === "Journal Type" || activeItem === "Journal Class") {
		return [
			getNoColumn(),
			getTruncateColumn({
				header: "Name",
				accessorKey: "name",
				size: 200,
				bodyClassName: "text-sky-600 font-medium overflow-hidden",
			}),
			getTruncateColumn({ header: "Description", accessorKey: "descr", size: 300 }),
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
		...(canEdit ? [getEditActionColumn({ header: "", headerClassName: "w-12" })] : []),
	];
};

export const columns = getColumnsForItem("default");
