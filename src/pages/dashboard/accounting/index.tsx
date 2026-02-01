import { useState } from "react";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { useAccountingList } from "@/core/store/accountingListStore";
import { AccountingContent } from "./components/accounting-content";
import { AccountingSidebar } from "./components/accounting-sidebar";

export default function AccountingPage() {
	const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
	const listState = useAccountingList();

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20" : "lg:w-1/4"}
			sidebar={
				<AccountingSidebar
					activeAccountId={activeAccountId}
					onSelect={setActiveAccountId}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={<AccountingContent activeAccountId={activeAccountId} listState={listState} />}
		/>
	);
}
