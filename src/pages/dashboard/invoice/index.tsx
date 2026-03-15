import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import type { Cycle } from "@/core/types/cycle";
import { CustomerSidebar } from "@/pages/dashboard/customers/components/customer-sidebar";
import { CycleContent } from "./components/cycle-content";
import { InvoiceContent } from "./components/invoice-content";
import { useCycleDetail } from "./hooks/use-cycle-detail";
import { useInvoiceTable } from "./hooks/use-invoice-table";

export default function InvoicePage() {
	const [searchParams] = useSearchParams();
	const [activeCustomerId, setActiveCustomerId] = useState<string | null>(() => searchParams.get("customerId"));
	const [activeCustomerName, setActiveCustomerName] = useState<string | null>(() => searchParams.get("customerName"));
	const [activeCycleSnapshot, setActiveCycleSnapshot] = useState<Cycle | null>(null);
	const [activeCycleId, setActiveCycleId] = useState<string | null>(() => searchParams.get("cycleId"));
	const { isCollapsed, handleToggle } = useSidebarCollapse();
	const { data: activeCycleDetail } = useCycleDetail(activeCycleId);
	const activeCycle = activeCycleDetail ?? activeCycleSnapshot;

	useEffect(() => {
		const queryCustomerId = searchParams.get("customerId");
		const queryCustomerName = searchParams.get("customerName");
		const queryCycleId = searchParams.get("cycleId");
		setActiveCustomerId((prev) => (prev === queryCustomerId ? prev : queryCustomerId));
		setActiveCustomerName((prev) => (prev === queryCustomerName ? prev : queryCustomerName));
		setActiveCycleId((prev) => (prev === queryCycleId ? prev : queryCycleId));
		if (!queryCycleId) {
			setActiveCycleSnapshot(null);
		}
	}, [searchParams]);

	const handleSelectCustomer = useCallback((customer: Customer | null) => {
		setActiveCustomerId((prev) => (prev === (customer?.id ?? null) ? prev : (customer?.id ?? null)));
		setActiveCustomerName((prev) => (prev === (customer?.name ?? null) ? prev : (customer?.name ?? null)));
		setActiveCycleSnapshot(null);
		setActiveCycleId(null);
	}, []);

	const handleSelectCycle = useCallback((cycle: Cycle) => {
		setActiveCycleSnapshot(cycle);
		setActiveCycleId(cycle.id);
		setActiveCustomerId((prev) => (prev === cycle.customerId ? prev : cycle.customerId));
		setActiveCustomerName((prev) => (prev === cycle.customerName ? prev : cycle.customerName));
	}, []);

	const handleBackToCycles = useCallback(() => {
		setActiveCycleSnapshot(null);
		setActiveCycleId(null);
		setActiveCustomerId(null);
		setActiveCustomerName(null);
	}, []);

	// Invoice table — only used when a cycle is selected
	const invoiceTable = useInvoiceTable({
		customerName: activeCycle ? (activeCustomerName ?? activeCycle.customerName) : null,
		customerId: activeCycle ? (activeCustomerId ?? activeCycle.customerId) : null,
		cycleId: activeCycleId ?? activeCycle?.id ?? null,
	});

	const activeInvoiceLabel = activeCycle ? `${activeCustomerName ?? activeCycle.customerName}` : null;

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20 xl:w-20" : "lg:w-[16rem] xl:w-1/5"}
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
				activeCycle ? (
					<InvoiceContent
						{...invoiceTable}
						activeInvoiceLabel={activeInvoiceLabel}
						onBack={handleBackToCycles}
						activeCycle={activeCycle}
					/>
				) : (
					<CycleContent
						customerId={activeCustomerId}
						customerName={activeCustomerName}
						onSelectCycle={handleSelectCycle}
					/>
				)
			}
		/>
	);
}
