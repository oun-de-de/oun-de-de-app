import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import type { Cycle } from "@/core/types/cycle";
import { CustomerSidebar } from "@/pages/dashboard/customers/components/customer-sidebar";
import { CycleContent } from "./components/cycle-content";
import { InvoiceContent } from "./components/invoice-content";
import { useInvoiceTable } from "./hooks/use-invoice-table";

export default function InvoicePage() {
	const [searchParams] = useSearchParams();
	const [activeCustomerId, setActiveCustomerId] = useState<string | null>(() => searchParams.get("customerId"));
	const [activeCustomerName, setActiveCustomerName] = useState<string | null>(() => searchParams.get("customerName"));
	const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
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
		setActiveCycle(null);
	}, []);

	const handleSelectCycle = useCallback((cycle: Cycle) => {
		setActiveCycle(cycle);
		setActiveCustomerId((prev) => (prev === cycle.customerId ? prev : cycle.customerId));
		setActiveCustomerName((prev) => (prev === cycle.customerName ? prev : cycle.customerName));
	}, []);

	const handleBackToCycles = useCallback(() => {
		setActiveCycle(null);
	}, []);

	// Invoice table — only used when a cycle is selected
	const invoiceTable = useInvoiceTable({
		customerName: activeCycle ? (activeCustomerName ?? activeCycle.customerName) : null,
		customerId: activeCycle ? (activeCustomerId ?? activeCycle.customerId) : null,
	});

	const activeInvoiceLabel = activeCycle
		? `${activeCustomerName ?? activeCycle.customerName} — ${new Date(activeCycle.startDate).toLocaleDateString()} ~ ${new Date(activeCycle.endDate).toLocaleDateString()}`
		: null;

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20" : "lg:w-1/4"}
			sidebar={
				<CustomerSidebar
					activeCustomerId={activeCustomerId ?? null}
					onSelect={handleSelectCustomer}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
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
