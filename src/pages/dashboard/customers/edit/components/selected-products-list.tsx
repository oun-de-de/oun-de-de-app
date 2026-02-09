import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { SmartDataTable } from "@/core/components/common/smart-data-table";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import type { ProductSettingItem } from "../hooks/use-product-settings-form";

interface SelectedProductsListProps {
	settings: ProductSettingItem[];
	onChange: (productId: string, field: "price" | "unit" | "quantity", value: string) => void;
	onRemove: (productId: string) => void;
}

export function SelectedProductsList({ settings, onChange, onRemove }: SelectedProductsListProps) {
	const columns = useMemo<ColumnDef<ProductSettingItem>[]>(
		() => [
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
				header: "Product",
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
				accessorKey: "unit",
				size: 100,
				cell: ({ row }) => (
					<Input
						value={row.original.unit}
						onChange={(e) => onChange(row.original.productId, "unit", e.target.value)}
						className="w-full h-8"
					/>
				),
			},
			{
				header: "Quantity",
				accessorKey: "quantity",
				size: 100,
				cell: ({ row }) => (
					<Input
						type="number"
						value={row.original.quantity}
						onChange={(e) => onChange(row.original.productId, "quantity", e.target.value)}
						className="w-full h-8"
					/>
				),
			},
			{
				header: "Price",
				accessorKey: "price",
				size: 100,
				cell: ({ row }) => (
					<Input
						type="number"
						value={row.original.price}
						onChange={(e) => onChange(row.original.productId, "price", e.target.value)}
						className="w-full h-8"
					/>
				),
			},
			{
				id: "actions",
				header: "",
				size: 30,
				cell: ({ row }) => (
					<div className="flex justify-center">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onRemove(row.original.productId)}
							className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				),
			},
		],
		[onChange, onRemove],
	);

	return (
		<div className="border rounded-md overflow-hidden flex flex-col h-full">
			<div className="bg-gray-100 px-4 py-3 border-b shrink-0 flex items-center justify-between">
				<span className="font-medium text-sm">Selected Products</span>
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
