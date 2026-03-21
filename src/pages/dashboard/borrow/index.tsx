import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import { useBorrowActions, useBorrowState } from "@/pages/dashboard/borrow/stores/borrow-store";
import { CustomerSidebar } from "@/pages/dashboard/customers/components/customer-sidebar";
import { BorrowContent } from "./components/borrow-content";

export default function BorrowPage() {
	const [searchParams] = useSearchParams();
	const [activeCustomerId, setActiveCustomerId] = useState<string | null>(() => searchParams.get("customerId"));
	const [activeCustomerName, setActiveCustomerName] = useState<string | null>(() => searchParams.get("customerName"));

	const listState = useBorrowState();
	const { updateState } = useBorrowActions();
	const { isCollapsed, handleToggle } = useSidebarCollapse();

	useEffect(() => {
		const queryCustomerId = searchParams.get("customerId");
		const queryCustomerName = searchParams.get("customerName");
		setActiveCustomerId((prev) => (prev === queryCustomerId ? prev : queryCustomerId));
		setActiveCustomerName((prev) => (prev === queryCustomerName ? prev : queryCustomerName));
	}, [searchParams]);

	const handleSelectCustomer = useCallback((customer: Customer | null) => {
		setActiveCustomerId((prev) => (prev === (customer?.id ?? null) ? prev : (customer?.id ?? null)));
		setActiveCustomerName((prev) => (prev === (customer?.name ?? null) ? prev : (customer?.name ?? null)));
	}, []);

	return (
		<DashboardSplitView
			isSidebarCollapsed={isCollapsed}
			sidebarClassName={isCollapsed ? "lg:w-14 xl:w-14" : "lg:w-[16rem] xl:w-1/5"}
			sidebar={
				<CustomerSidebar
					activeCustomerId={activeCustomerId ?? null}
					onSelect={handleSelectCustomer}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
					showPaymentTermFilter={false}
				/>
			}
			content={
				<BorrowContent
					activeCustomerId={activeCustomerId}
					activeCustomerName={activeCustomerName}
					listState={listState}
					updateState={updateState}
				/>
			}
		/>
	);
}
