import type { ColumnDef } from "@tanstack/react-table";
import { List } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { SmartDataTable } from "@/core/components/common/smart-data-table";
import type { InventoryItem } from "@/core/types/inventory";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { SectionHeader } from "@/pages/dashboard/borrow/components/borrow-section-header";
import { useBorrowCartActions } from "@/pages/dashboard/borrow/stores/borrow-cart-store";
import { useInventoryItems } from "@/pages/dashboard/equipment/hooks/use-inventory-items";
import { BorrowCreateCartPanel } from "./borrow-create-cart-panel";
import { getBorrowCreateColumns } from "./borrow-create-columns";
import { BorrowCreateHeader } from "./borrow-create-header";
import { BorrowCreateLayout } from "./borrow-create-layout";

export function BorrowCreateView() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { addToCart } = useBorrowCartActions();
	const { data: items = [] } = useInventoryItems();

	const handleAddToCart = useCallback(
		(item: InventoryItem) => {
			addToCart({
				id: item.id,
				code: item.code,
				name: item.name,
				price: 0,
				inStock: item.quantityOnHand,
			});
		},
		[addToCart],
	);

	const columns = useMemo<ColumnDef<InventoryItem>[]>(() => getBorrowCreateColumns(handleAddToCart), [handleAddToCart]);

	const totalItems = items.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const currentPage = Math.min(page, totalPages);
	const pagedData = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return items.slice(start, start + pageSize);
	}, [currentPage, items, pageSize]);

	return (
		<BorrowCreateLayout header={<BorrowCreateHeader />} rightPanel={<BorrowCreateCartPanel />}>
			<div className="px-6 py-2">
				<div className="border-t border-gray-100"></div>
			</div>

			<div className="flex-1 flex flex-col min-h-0 px-6 pb-4">
				<SectionHeader title="Available Equipment" icon={List} />
				<div className="flex-1 bg-white flex flex-col overflow-hidden">
					<SmartDataTable
						data={pagedData}
						columns={columns}
						className="border-none shadow-none text-sm flex-1 min-h-0"
						maxBodyHeight="100%"
						paginationConfig={{
							page: currentPage,
							pageSize,
							totalItems,
							totalPages,
							onPageChange: setPage,
							onPageSizeChange: (size) => {
								setPageSize(size);
								setPage(1);
							},
							paginationItems: buildPagination(currentPage, totalPages),
						}}
					/>
				</div>
			</div>
		</BorrowCreateLayout>
	);
}
