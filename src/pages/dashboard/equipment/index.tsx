import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { EquipmentContent } from "./components/equipment-content";
import { EquipmentSidebar } from "./components/equipment-sidebar";

export default function EquipmentCenterPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [activeItemId, setActiveItemId] = useState<string | null>(() => searchParams.get("itemId"));
	const { isCollapsed, handleToggle } = useSidebarCollapse();

	useEffect(() => {
		const queryItemId = searchParams.get("itemId");
		setActiveItemId((prev) => (prev === queryItemId ? prev : queryItemId));
	}, [searchParams]);

	const handleSelectItem = useCallback(
		(itemId: string | null) => {
			setActiveItemId(itemId);
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					if (itemId) next.set("itemId", itemId);
					else next.delete("itemId");
					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	return (
		<DashboardSplitView
			isSidebarCollapsed={isCollapsed}
			sidebarClassName={isCollapsed ? "md:w-14 xl:w-14" : "md:w-[16rem] xl:w-1/5"}
			sidebar={
				<EquipmentSidebar
					activeItemId={activeItemId}
					onSelect={handleSelectItem}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={<EquipmentContent activeItemId={activeItemId} onClearSelection={() => handleSelectItem(null)} />}
		/>
	);
}
