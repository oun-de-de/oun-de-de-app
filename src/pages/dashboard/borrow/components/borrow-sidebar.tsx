import { useMemo } from "react";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { up, useMediaQuery } from "@/core/hooks/use-media-query";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import { cn } from "@/core/utils";
import { formatKHR } from "@/core/utils/formatters";
import { useLoans } from "../hooks/use-loans";
import type { BorrowState } from "../stores/borrow-state";

type Props = {
	activeBorrowId: string | null;
	listState: BorrowState;
	updateState: (updates: Partial<Omit<BorrowState, "type">>) => void;
	onSelect: (id: string | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

const DEFAULT_ITEM_SIZE = 56;
const COLLAPSED_ITEM_SIZE = 42;
const COLLAPSED_ITEM_GAP = 8;

type BorrowSidebarItem = {
	id: string;
	name: string;
	code: string;
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const matchType = (item: BorrowSidebarItem, typeFilter: BorrowState["typeFilter"], typeMap: Map<string, string>) =>
	typeFilter === "all" || typeMap.get(item.id) === typeFilter;

const matchSearch = (item: BorrowSidebarItem, normalizedQuery: string) =>
	normalizedQuery === "" ||
	item.code.toLowerCase().includes(normalizedQuery) ||
	item.name.toLowerCase().includes(normalizedQuery);

export function BorrowSidebar({ activeBorrowId, listState, updateState, onSelect, onToggle, isCollapsed }: Props) {
	const { searchValue, typeFilter } = listState;
	const isLgUp = useMediaQuery(up("lg"));
	const normalizedQuery = normalizeText(searchValue);

	const { data: loansResponse } = useLoans();
	const loans = loansResponse?.content ?? [];

	const sidebarItems = useMemo<BorrowSidebarItem[]>(
		() =>
			loans.map((loan) => ({
				id: loan.id,
				name: loan.borrowerName,
				code: `${loan.borrowerType} | ${formatKHR(loan.principalAmount)} | ${loan.borrowerId}`,
			})),
		[loans],
	);

	const typeMap = useMemo(() => {
		const map = new Map<string, string>();
		for (const loan of loans) {
			map.set(loan.id, loan.borrowerType);
		}
		return map;
	}, [loans]);

	const filteredList = useMemo(
		() => sidebarItems.filter((item) => matchType(item, typeFilter, typeMap) && matchSearch(item, normalizedQuery)),
		[normalizedQuery, typeFilter, sidebarItems, typeMap],
	);

	const pagination = useSidebarPagination({
		data: filteredList,
		enabled: !isLgUp,
	});

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={false}
				showStatusFilter={false}
				searchPlaceholder="Search loans..."
				searchValue={searchValue}
				onSearchChange={(value) => updateState({ searchValue: value, page: 1 })}
				onMenuClick={onToggle}
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				className={cn("mt-2 flex-1 min-h-0", !isCollapsed && "divide-y divide-border-gray-300")}
				data={pagination.pagedData}
				estimateSize={isCollapsed ? COLLAPSED_ITEM_SIZE : DEFAULT_ITEM_SIZE}
				gap={isCollapsed ? COLLAPSED_ITEM_GAP : 0}
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
