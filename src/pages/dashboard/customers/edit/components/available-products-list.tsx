import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SmartDataTable } from "@/core/components/common/smart-data-table";
import type { Product } from "@/core/types/product";

interface AvailableProductsListProps {
	products: Product[];
	onAdd: (product: Product) => void;
}

export function AvailableProductsList({ products, onAdd }: AvailableProductsListProps) {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredProducts = useMemo(() => {
		return products.filter(
			(product) =>
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.refNo.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [products, searchTerm]);

	const columns = useMemo<ColumnDef<Product>[]>(
		() => [
			{
				header: "No",
				id: "no",
				cell: ({ row }) => <span className="text-gray-500">{row.index + 1}</span>,
				size: 50,
				meta: {
					bodyClassName: "text-center",
				},
			},
			{
				header: "Ref No",
				accessorKey: "refNo",
			},
			{
				header: "Product Name",
				accessorKey: "name",
			},
		],
		[],
	);

	return (
		<div className="border rounded-md overflow-hidden flex flex-col h-full">
			<div className="bg-gray-100 px-4 py-3 border-b shrink-0 flex items-center justify-between">
				<span className="font-medium text-sm">Available Products</span>
			</div>
			<div className="flex-1 overflow-hidden">
				<SmartDataTable
					data={filteredProducts}
					columns={columns}
					filterConfig={{
						searchValue: searchTerm,
						onSearchChange: setSearchTerm,
						searchPlaceholder: "Search by name or ref...",
					}}
					enableFilterBar={false}
					onRowClick={onAdd}
					maxBodyHeight="100%"
					variant="borderless"
				/>
			</div>
		</div>
	);
}
