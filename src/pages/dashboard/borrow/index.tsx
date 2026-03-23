import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import { useBorrowActions, useBorrowState } from "@/pages/dashboard/borrow/stores/borrow-store";
import { CustomerSidebar } from "@/pages/dashboard/customers/components/customer-sidebar";
import { BorrowContent } from "./components/borrow-content";

export default function BorrowPage() {
	const navigate = useNavigate();
	const location = useLocation();
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

	const updateBorrowSearchParams = useCallback(
		(next: { customerId?: string | null; customerName?: string | null }) => {
			const params = new URLSearchParams(location.search);

			if (next.customerId) {
				params.set("customerId", next.customerId);
			} else {
				params.delete("customerId");
			}

			if (next.customerName) {
				params.set("customerName", next.customerName);
			} else {
				params.delete("customerName");
			}

			const nextSearch = params.toString();
			navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ""}`);
		},
		[location.pathname, location.search, navigate],
	);

	const handleSelectCustomer = useCallback(
		(customer: Customer | null) => {
			const nextCustomerId = customer?.id ?? null;
			const nextCustomerName = customer?.name ?? null;
			setActiveCustomerId((prev) => (prev === nextCustomerId ? prev : nextCustomerId));
			setActiveCustomerName((prev) => (prev === nextCustomerName ? prev : nextCustomerName));
			updateBorrowSearchParams({
				customerId: nextCustomerId,
				customerName: nextCustomerName,
			});
		},
		[updateBorrowSearchParams],
	);

	return (
		<DashboardSplitView
			isSidebarCollapsed={isCollapsed}
			sidebarClassName={isCollapsed ? "md:w-14 xl:w-14" : "md:w-[16rem] xl:w-1/5"}
			sidebar={
				<CustomerSidebar
					activeCustomerId={activeCustomerId ?? null}
					activeCustomerName={activeCustomerName ?? null}
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
