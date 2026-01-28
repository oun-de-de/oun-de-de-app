import { useState } from "react";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useBorrowList, useBorrowListActions } from "@/pages/dashboard/borrow/stores/borrowStore";
import { BorrowContent } from "./components/borrow-content";
import { BorrowSidebar } from "./components/borrow-sidebar";

export default function BorrowPage() {
	const [activeBorrowId, setActiveBorrowId] = useState<string | null>(null);
	const listState = useBorrowList();
	const { updateState } = useBorrowListActions();

	return (
		<DashboardSplitView
			sidebar={<BorrowSidebar activeBorrowId={activeBorrowId} onSelect={setActiveBorrowId} />}
			content={<BorrowContent activeBorrowId={activeBorrowId} listState={listState} updateState={updateState} />}
		/>
	);
}
