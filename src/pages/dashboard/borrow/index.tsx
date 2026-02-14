import { useState } from "react";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { useBorrowActions, useBorrowState } from "@/pages/dashboard/borrow/stores/borrow-store";
import { BorrowContent } from "./components/borrow-content";
import { BorrowSidebar } from "./components/borrow-sidebar";

export default function BorrowPage() {
	const [activeBorrowId, setActiveBorrowId] = useState<string | null>(null);
	const listState = useBorrowState();
	const { updateState } = useBorrowActions();
	const { isCollapsed, handleToggle } = useSidebarCollapse();

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20" : "lg:w-1/4"}
			sidebar={
				<BorrowSidebar
					activeBorrowId={activeBorrowId}
					listState={listState}
					updateState={updateState}
					onSelect={setActiveBorrowId}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={<BorrowContent activeBorrowId={activeBorrowId} listState={listState} updateState={updateState} />}
		/>
	);
}
