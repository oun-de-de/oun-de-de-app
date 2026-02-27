import { useMemo, useState } from "react";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { up, useMediaQuery } from "@/core/hooks/use-media-query";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import type { InventoryItem } from "@/core/types/inventory";
import { cn } from "@/core/utils";
import { useInventoryItems } from "../hooks/use-inventory-items";

type Props = {
	activeItemId: string | null;
	onSelect: (id: string | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const matchSearch = (item: InventoryItem, normalizedQuery: string) =>
	normalizedQuery === "" ||
	item.name.toLowerCase().includes(normalizedQuery) ||
	item.code.toLowerCase().includes(normalizedQuery);

const DEFAULT_ITEM_SIZE = 56;
const COLLAPSED_ITEM_SIZE = 42;
const COLLAPSED_ITEM_GAP = 8;

export function EquipmentSidebar({ activeItemId, onSelect, onToggle, isCollapsed }: Props) {
	const [searchTerm, setSearchTerm] = useState("");
	const isLgUp = useMediaQuery(up("lg"));
	const normalizedQuery = normalizeText(searchTerm);

	const { data: items = [] } = useInventoryItems();

	const filteredList = useMemo(
		() => items.filter((item) => matchSearch(item, normalizedQuery)),
		[items, normalizedQuery],
	);

	const pagination = useSidebarPagination({
		data: filteredList,
		enabled: !isLgUp,
	});

	const sidebarData = pagination.pagedData.map((item) => ({
		id: item.id,
		name: item.name,
		code: item.code,
	}));

	const handleSelect = (id: string | null) => {
		onSelect(id);
	};

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={false}
				searchPlaceholder="Search equipment..."
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onMenuClick={onToggle}
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
						isActive={item.id === activeItemId}
						onSelect={handleSelect}
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
