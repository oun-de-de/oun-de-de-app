import { useMemo, useState } from "react";

import { EntityListItem, SidebarList } from "@/core/components/common";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import type { Product } from "@/core/types/product";
import { cn } from "@/core/utils";
import { normalizeToken } from "@/core/utils/dashboard-utils";

type ProductSidebarProps = {
	activeProductId: string | null;
	onSelect: (id: string | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
	products: Product[];
};

const DEFAULT_ITEM_SIZE = 56;

export function ProductSidebar({ activeProductId, onSelect, onToggle, isCollapsed, products }: ProductSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredProducts = useMemo(() => {
		const normalizedSearch = normalizeToken(searchTerm);

		return products.filter((product) => {
			// Filter by Search (Name or RefNo)
			if (normalizedSearch) {
				const name = normalizeToken(product.name || "");
				const code = normalizeToken(product.refNo || "");
				if (!name.includes(normalizedSearch) && !code.includes(normalizedSearch)) {
					return false;
				}
			}

			return true;
		});
	}, [searchTerm, products]);

	const pagination = useSidebarPagination({
		data: filteredProducts,
	});

	// Map products to EntityListItemData format (requires code)
	const sidebarData = pagination.pagedData.map((product) => ({
		...product,
		code: product.refNo,
	}));

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={false}
				showStatusFilter={false}
				onMenuClick={onToggle}
				searchPlaceholder="Search..."
				onSearchChange={setSearchTerm}
				isCollapsed={isCollapsed}
			/>

			{isCollapsed ? (
				<SidebarList.CollapsedHint text="Click to expand product list" onClick={onToggle} />
			) : (
				<>
					<SidebarList.Body
						key="expanded"
						className={cn("mt-2 flex-1 min-h-0 divide-y divide-border-gray-300")}
						data={sidebarData}
						estimateSize={DEFAULT_ITEM_SIZE}
						height="100%"
						renderItem={(item, style) => (
							<EntityListItem
								key={item.id}
								entity={item}
								isActive={item.id === activeProductId}
								onSelect={onSelect}
								style={style}
							/>
						)}
					/>

					<SidebarList.Footer
						total={pagination.total}
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						rangeStart={pagination.rangeStart}
						rangeEnd={pagination.rangeEnd}
						isCollapsed={false}
						onPrev={pagination.handlePrev}
						onNext={pagination.handleNext}
						hasPrev={pagination.hasPrev}
						hasNext={pagination.hasNext}
						showControls={pagination.totalPages > 1}
					/>
				</>
			)}
		</SidebarList>
	);
}
