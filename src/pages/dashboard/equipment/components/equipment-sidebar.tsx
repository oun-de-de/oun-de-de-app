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
				showStatusFilter={false}
				searchPlaceholder="Search equipment..."
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onMenuClick={onToggle}
				isCollapsed={isCollapsed}
			/>

			{isCollapsed ? (
				<SidebarList.CollapsedHint text="Click to expand equipment list" onClick={onToggle} />
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
								isActive={item.id === activeItemId}
								onSelect={handleSelect}
								style={style}
							/>
						)}
					/>

					<SidebarList.Footer
						total={pagination.total}
						isCollapsed={false}
						onPrev={pagination.handlePrev}
						onNext={pagination.handleNext}
						hasPrev={pagination.hasPrev}
						hasNext={pagination.hasNext}
						showControls={!isLgUp && pagination.totalPages > 1}
					/>
				</>
			)}
		</SidebarList>
	);
}
