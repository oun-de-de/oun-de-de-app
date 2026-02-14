import { useMemo } from "react";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { up, useMediaQuery } from "@/core/hooks/use-media-query";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import type { SelectOption } from "@/core/types/common";
import type { BorrowState } from "../stores/borrow-state";

type Props = {
	activeBorrowId: string | null;
	listState: BorrowState;
	updateState: (updates: Partial<Omit<BorrowState, "type">>) => void;
	onSelect: (id: string | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "all", label: "All" },
	{ value: "Active", label: "Active" },
	{ value: "Returned", label: "Returned" },
	{ value: "Overdue", label: "Overdue" },
];

type BorrowSidebarItem = {
	id: string;
	name: string;
	code: string;
	status: string;
};

const MOCK_LIST: BorrowSidebarItem[] = [
	{ id: "1", name: "John Doe", code: "BR-2025-001", status: "Active" },
	{ id: "2", name: "Jane Smith", code: "BR-2025-002", status: "Active" },
	{ id: "3", name: "Alice Johnson", code: "BR-2025-003", status: "Returned" },
];

const normalizeText = (value: string) => value.trim().toLowerCase();

const matchStatus = (item: BorrowSidebarItem, statusFilter: BorrowState["typeFilter"]) =>
	statusFilter === "all" || item.status === statusFilter;

const matchSearch = (item: BorrowSidebarItem, normalizedQuery: string) =>
	normalizedQuery === "" ||
	item.code.toLowerCase().includes(normalizedQuery) ||
	item.name.toLowerCase().includes(normalizedQuery);

const isBorrowTypeFilter = (value: string): value is BorrowState["typeFilter"] =>
	value === "all" || value === "Active" || value === "Returned" || value === "Overdue";

export function BorrowSidebar({ activeBorrowId, listState, updateState, onSelect, onToggle, isCollapsed }: Props) {
	const { searchValue, typeFilter } = listState;
	const isLgUp = useMediaQuery(up("lg"));
	const normalizedQuery = normalizeText(searchValue);

	const filteredList = useMemo(
		() => MOCK_LIST.filter((item) => matchStatus(item, typeFilter) && matchSearch(item, normalizedQuery)),
		[normalizedQuery, typeFilter],
	);

	const pagination = useSidebarPagination({
		data: filteredList,
		enabled: !isLgUp,
	});

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={false}
				searchPlaceholder="Search ref or name..."
				searchValue={searchValue}
				onSearchChange={(value) => updateState({ searchValue: value, page: 1 })}
				statusOptions={STATUS_OPTIONS}
				statusValue={typeFilter}
				onStatusChange={(value) => {
					if (!isBorrowTypeFilter(value)) return;
					updateState({ typeFilter: value, page: 1 });
				}}
				onMenuClick={onToggle}
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				className="flex-1 min-h-0"
				data={pagination.pagedData}
				estimateSize={40}
				gap={8}
				height="100%"
				renderItem={(item, style) => (
					<EntityListItem
						key={item.id}
						entity={item}
						isActive={item.id === activeBorrowId}
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
