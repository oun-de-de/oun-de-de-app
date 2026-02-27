import { useMemo, useState } from "react";

import { EntityListItem, SidebarList } from "@/core/components/common";
import { up, useMediaQuery } from "@/core/hooks/use-media-query";
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
const COLLAPSED_ITEM_SIZE = 42;
const COLLAPSED_ITEM_GAP = 8;

export function ProductSidebar({ activeProductId, onSelect, onToggle, isCollapsed, products }: ProductSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const isLgUp = useMediaQuery(up("lg"));

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
		enabled: !isLgUp,
	});

	// Map products to EntityListItemData format (requires code)
	const sidebarData = pagination.pagedData.map((product) => ({
		...product,
		code: product.refNo,
	}));

	return (
		<SidebarList>
			<SidebarList.Header
				onMenuClick={onToggle}
				searchPlaceholder="Search..."
				onSearchChange={setSearchTerm}
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				key={isCollapsed ? "collapsed" : "expanded"}
				className={cn("mt-2 flex-1 min-h-0", !isCollapsed && "divide-y divide-border-gray-300")}
				data={sidebarData}
				estimateSize={isCollapsed ? COLLAPSED_ITEM_SIZE : DEFAULT_ITEM_SIZE}
				gap={isCollapsed ? COLLAPSED_ITEM_GAP : 0}
				height="100%"
				renderItem={(item, style) => (
					<EntityListItem
						key={item.id}
						entity={item}
						isActive={item.id === activeProductId}
						onSelect={onSelect}
						style={style}
						isCollapsed={isCollapsed}
					/>
				)}
			/>

			<SidebarList.Footer
				total={pagination.total}
				isCollapsed={isCollapsed}
				onPrev={pagination.handlePrev}
				onNext={pagination.handleNext}
				hasPrev={pagination.hasPrev}
				hasNext={pagination.hasNext}
				showControls={!isLgUp && pagination.totalPages > 1}
			/>
		</SidebarList>
	);
}
