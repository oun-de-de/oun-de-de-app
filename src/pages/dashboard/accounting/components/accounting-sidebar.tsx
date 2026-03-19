import { EntityListItem, SidebarList } from "@/core/components/common";
import { ACCOUNTING_SIDEBAR_TYPE_OPTIONS } from "../constants";
import { useAccountingSidebarState } from "../hooks/use-accounting-sidebar-state";
import type { AccountingAccountListItem } from "../types";

type AccountingSidebarProps = {
	items: AccountingAccountListItem[];
	activeAccountId: string | null;
	onSelect: (id: string | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

export function AccountingSidebar({ items, activeAccountId, onSelect, onToggle, isCollapsed }: AccountingSidebarProps) {
	const { isLgUp, pagination, searchValue, setSearchValue, statusFilter, setStatusFilter, typeFilter, setTypeFilter } =
		useAccountingSidebarState({ items });

	return (
		<SidebarList>
			<SidebarList.Header
				mainTypeOptions={ACCOUNTING_SIDEBAR_TYPE_OPTIONS}
				mainTypePlaceholder="Account type"
				mainTypeValue={typeFilter}
				onMainTypeChange={setTypeFilter}
				searchPlaceholder="Search..."
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				statusPlaceholder="Active"
				statusValue={statusFilter}
				onStatusChange={setStatusFilter}
				onMenuClick={onToggle}
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				className="mt-1 flex-1 min-h-0 divide-y divide-border-gray-300"
				data={pagination.pagedData}
				estimateSize={56}
				height="100%"
				renderItem={(account: AccountingAccountListItem, style) => (
					<EntityListItem
						key={account.id}
						entity={account}
						isActive={account.id === activeAccountId}
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
