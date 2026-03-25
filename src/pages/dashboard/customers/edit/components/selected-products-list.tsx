import type { ColumnDef } from "@tanstack/react-table";
import { Copy, RotateCcw, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { SmartDataTable } from "@/core/components/common/smart-data-table";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/core/ui/tooltip";
import type { ProductSettingItem } from "../hooks/use-product-settings-form";

const getColumns = (
	existingProductIds: Set<string>,
	onChange: (productId: string, field: "price" | "quantity", value: string) => void,
	onRemove: (productId: string) => void,
): ColumnDef<ProductSettingItem>[] => [
	{
		header: "No",
		id: "no",
		cell: ({ row }) => <span className="text-gray-500">{row.index + 1}</span>,
		size: 30,
		meta: {
			bodyClassName: "text-center",
		},
	},
	{
		header: "Product Name",
		accessorFn: (row) => `${row.productRef} - ${row.productName}`,
		cell: ({ row }) => (
			<div className="flex items-center justify-between gap-2">
				<div>
					<div className="font-medium">{row.original.productName}</div>
					<div className="text-xs text-gray-500">{row.original.productRef}</div>
				</div>
				{/* copy button */}
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 cursor-pointer"
					onClick={() => {
						navigator.clipboard.writeText(`${row.original.productRef} - ${row.original.productName}`);
						toast.success("Product code copied to clipboard");
					}}
				>
					<Copy className="h-4 w-4" />
				</Button>
			</div>
		),
	},
	{
		header: "Unit",
		accessorKey: "unitLabel",
		size: 100,
		cell: ({ row }) => <span>{row.original.unitLabel}</span>,
	},
	{
		header: "Quantity",
		accessorKey: "quantity",
		size: 100,
		cell: ({ row }) => {
			const quantityInput = (
				<Input
					type="number"
					value={row.original.quantity ?? ""}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						onChange(row.original.productId, "quantity", e.target.value)
					}
					className="w-full h-8"
					disabled={!row.original.isPackagedByQuantity}
				/>
			);

			if (row.original.isPackagedByQuantity) return quantityInput;

			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="w-full cursor-help">{quantityInput}</div>
						</TooltipTrigger>
						<TooltipContent side="top">This product does not use quantity.</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		},
	},
	{
		header: "Price",
		accessorKey: "price",
		size: 100,
		cell: ({ row }) => (
			<Input
				type="number"
				value={row.original.price}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(row.original.productId, "price", e.target.value)}
				className="w-full h-8"
			/>
		),
	},
	{
		id: "actions",
		size: 40,
		cell: ({ row }) => {
			const isExisting = existingProductIds.has(row.original.productId);
			const actionLabel = isExisting
				? `Reset ${row.original.productName} to default`
				: `Remove ${row.original.productName}`;
			const actionTooltip = isExisting
				? "Reset this customer-specific setting back to the product default values."
				: "Remove this unsaved product setting.";
			const ActionIcon = isExisting ? RotateCcw : Trash2;
			const actionClassName = isExisting
				? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
				: "text-red-500 hover:text-red-700 hover:bg-red-50";

			return (
				<div className="flex justify-center">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onRemove(row.original.productId)}
									className={actionClassName}
									aria-label={actionLabel}
								>
									<ActionIcon />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top">{actionTooltip}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			);
		},
	},
];

interface SelectedProductsListProps {
	settings: ProductSettingItem[];
	existingProductIds: Set<string>;
	onChange: (productId: string, field: "price" | "quantity", value: string) => void;
	onRemove: (productId: string) => void;
}

export function SelectedProductsList({ settings, existingProductIds, onChange, onRemove }: SelectedProductsListProps) {
	const columns = useMemo(
		() => getColumns(existingProductIds, onChange, onRemove),
		[existingProductIds, onChange, onRemove],
	);

	return (
		<div className="border rounded-md overflow-hidden flex flex-col h-full">
			<div className="bg-gray-100 px-4 py-3 border-b shrink-0 flex items-center justify-between">
				<div className="flex flex-col">
					<span className="font-medium text-sm">Selected Products</span>
					<span className="text-xs text-gray-500">
						Existing items reset to default. Newly added items can be removed.
					</span>
				</div>
			</div>
			<div className="flex-1 overflow-hidden">
				<SmartDataTable
					data={settings}
					columns={columns}
					maxBodyHeight="100%"
					variant="borderless"
					enableFilterBar={false}
				/>
			</div>
		</div>
	);
}
