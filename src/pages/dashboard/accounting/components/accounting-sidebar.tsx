import { useMemo, useState } from "react";
import { accountingAccountList } from "@/_mock/data/dashboard";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { up, useMediaQuery } from "@/core/hooks/use-media-query";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";

// Infer type from mock data since it's not exported
type AccountingAccount = (typeof accountingAccountList)[number];

type AccountingSidebarProps = {
	activeAccountId: string | null;
	onSelect: (id: string | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

const MAIN_TYPE_OPTIONS = [
	{ value: "asset", label: "Asset" },
	{ value: "liability", label: "Liability" },
];

export function AccountingSidebar({ activeAccountId, onSelect, onToggle, isCollapsed }: AccountingSidebarProps) {
	const [typeFilter, setTypeFilter] = useState("type");
	const [searchValue, setSearchValue] = useState("");
	const [statusFilter, setStatusFilter] = useState("active");
	const isLgUp = useMediaQuery(up("lg"));

	const filteredAccounts = useMemo(() => {
		return accountingAccountList.filter((account) => {
			// Type filter
			if (typeFilter !== "type") {
				// account.type (if it exists) check or other logic
				// For now assuming simplistic match or ignoring if property missing
			}

			// Search filter
			if (searchValue) {
				const query = searchValue.toLowerCase();
				if (!account.name.toLowerCase().includes(query) && !account.id.includes(query)) {
					return false;
				}
			}

			// Status filter
			if (statusFilter !== "active") {
				// Mock logic for status
			}
			return true;
		});
	}, [typeFilter, searchValue, statusFilter]);

	const pagination = useSidebarPagination({
		data: filteredAccounts,
		enabled: !isLgUp,
	});

	return (
		<SidebarList>
			<SidebarList.Header
				mainTypeOptions={MAIN_TYPE_OPTIONS}
				mainTypePlaceholder="Account type"
				mainTypeValue={typeFilter}
				onMainTypeChange={setTypeFilter}
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				statusValue={statusFilter}
				onStatusChange={setStatusFilter}
				onMenuClick={onToggle}
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				className="flex-1 divide-y divide-border-gray-300 min-h-0"
				data={pagination.pagedData}
				estimateSize={56}
				height="100%"
				renderItem={(account: AccountingAccount, style) => (
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
