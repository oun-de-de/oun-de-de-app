import { useState } from "react";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { AccountingContent } from "./components/accounting-content";
import { AccountingSidebar } from "./components/accounting-sidebar";
import { useAccountingChartAccounts } from "./hooks/use-accounting-chart-accounts";
import { useAccountingTransactions } from "./hooks/use-accounting-transactions";
import { useAccountingList } from "./stores/accounting-list-store";

export default function AccountingPage() {
	const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
	const listState = useAccountingList();
	const { items } = useAccountingChartAccounts();
	const { rows, totalItems, totalPages } = useAccountingTransactions({
		page: listState.page,
		pageSize: listState.pageSize,
		typeFilter: listState.typeFilter,
		fieldFilter: listState.fieldFilter,
		searchValue: listState.searchValue,
	});

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	return (
		<DashboardSplitView
			isSidebarCollapsed={isCollapsed}
			sidebarClassName={isCollapsed ? "md:w-14 xl:w-14" : "md:w-[16rem] xl:w-1/6"}
			sidebar={
				<AccountingSidebar
					items={items}
					activeAccountId={activeAccountId}
					onSelect={setActiveAccountId}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={
				<AccountingContent
					accounts={items}
					rows={rows}
					totalItems={totalItems}
					totalPages={totalPages}
					activeAccountId={activeAccountId}
					listState={listState}
				/>
			}
		/>
	);
}
