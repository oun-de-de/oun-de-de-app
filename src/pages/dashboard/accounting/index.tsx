import { useState } from "react";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { useAccountingList } from "@/core/store/accountingListStore";
import { AccountingContent } from "./components/accounting-content";
import { AccountingSidebar } from "./components/accounting-sidebar";
import { useAccountingChartAccounts } from "./hooks/use-accounting-chart-accounts";

export default function AccountingPage() {
	const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
	const listState = useAccountingList();
	const { items } = useAccountingChartAccounts();

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20 xl:w-20" : "lg:w-[16rem] xl:w-1/5"}
			sidebar={
				<AccountingSidebar
					items={items}
					activeAccountId={activeAccountId}
					onSelect={setActiveAccountId}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={<AccountingContent accounts={items} activeAccountId={activeAccountId} listState={listState} />}
		/>
	);
}
