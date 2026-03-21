import { useMemo, useState } from "react";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { up, useMediaQuery } from "@/core/hooks/use-media-query";
import type { CashTransactionCounterparty } from "@/core/types/cash-transaction";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import { cn } from "@/core/utils";
import { normalizeToken } from "@/core/utils/dashboard-utils";

type AccountingCenterSidebarProps = {
	activeCounterpartyId: string | null;
	counterparties: CashTransactionCounterparty[];
	onSelect: (id: string | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

const DEFAULT_ITEM_SIZE = 56;
export function AccountingCenterSidebar({
	activeCounterpartyId,
	counterparties,
	onSelect,
	onToggle,
	isCollapsed,
}: AccountingCenterSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const isLgUp = useMediaQuery(up("lg"));

	const filteredCounterparties = useMemo(() => {
		const normalizedSearch = normalizeToken(searchTerm);

		return counterparties.filter((counterparty) => {
			if (!normalizedSearch) return true;

			return (
				normalizeToken(counterparty.name).includes(normalizedSearch) ||
				normalizeToken(counterparty.code).includes(normalizedSearch)
			);
		});
	}, [counterparties, searchTerm]);

	const pagination = useSidebarPagination({
		data: filteredCounterparties,
		enabled: !isLgUp,
	});

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={false}
				showStatusFilter={false}
				onMenuClick={onToggle}
				searchPlaceholder="Search name..."
				onSearchChange={setSearchTerm}
				isCollapsed={isCollapsed}
			/>

			{isCollapsed ? (
				<SidebarList.CollapsedHint text="Click to expand counterparty list" onClick={onToggle} />
			) : (
				<>
					<SidebarList.Body
						key="expanded"
						className={cn("mt-2 flex-1 min-h-0 divide-y divide-border-gray-300")}
						data={pagination.pagedData}
						estimateSize={DEFAULT_ITEM_SIZE}
						height="100%"
						renderItem={(item, style) => (
							<EntityListItem
								key={item.id}
								entity={item}
								isActive={item.id === activeCounterpartyId}
								onSelect={onSelect}
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
