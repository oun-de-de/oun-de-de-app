import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { useSearchParams } from "react-router";
import customerService from "@/core/api/services/customer-service";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import type { Cycle } from "@/core/types/cycle";
import { CustomerSidebar } from "@/pages/dashboard/customers/components/customer-sidebar";
import { CycleContent } from "./components/cycle-content";
import { InvoiceContent } from "./components/invoice-content";
import { useCycleDetail } from "./hooks/use-cycle-detail";
import { useInvoiceTable } from "./hooks/use-invoice-table";
import { useInvoiceActions, useInvoiceState } from "./stores/invoice-store";

const DEFAULT_INVOICE_PAGE = 1;
const DEFAULT_INVOICE_PAGE_SIZE = 20;
const DEFAULT_INVOICE_FIELD = "refNo";
const DEFAULT_INVOICE_SORTING: SortingState = [{ id: "date", desc: true }];

const normalizePositiveInt = (value: string | null, fallback: number) => {
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

function parseSorting(value: string | null): SortingState {
	if (!value) return DEFAULT_INVOICE_SORTING;

	const parsed = value
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			const [id, direction] = entry.split(":");
			if (!id) return null;
			return { id, desc: direction !== "asc" };
		})
		.filter((entry): entry is SortingState[number] => entry !== null);

	return parsed.length > 0 ? parsed : DEFAULT_INVOICE_SORTING;
}

function serializeSorting(value: SortingState) {
	return value.map((entry) => `${entry.id}:${entry.desc ? "desc" : "asc"}`).join(",");
}

export default function InvoicePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [activeCustomerId, setActiveCustomerId] = useState<string | null>(() => searchParams.get("customerId"));
	const [activeCustomerName, setActiveCustomerName] = useState<string | null>(() => searchParams.get("customerName"));
	const [activeCycleSnapshot, setActiveCycleSnapshot] = useState<Cycle | null>(null);
	const [activeCycleId, setActiveCycleId] = useState<string | null>(() => searchParams.get("cycleId"));
	const { isCollapsed, handleToggle } = useSidebarCollapse();
	const invoiceState = useInvoiceState();
	const { updateState: updateInvoiceState } = useInvoiceActions();
	const { data: activeCycleDetail } = useCycleDetail(activeCycleId);
	const { data: activeCustomerDetail } = useQuery({
		queryKey: ["invoice-active-customer", activeCustomerId],
		queryFn: () => customerService.getCustomer(activeCustomerId ?? ""),
		enabled: !!activeCustomerId,
	});
	const activeCycle = activeCycleDetail ?? activeCycleSnapshot;
	const activeCustomerPaymentTermDuration = activeCustomerDetail?.paymentTerm?.duration ?? null;

	useEffect(() => {
		const queryCustomerId = searchParams.get("customerId");
		const queryCustomerName = searchParams.get("customerName");
		const queryCycleId = searchParams.get("cycleId");
		const nextInvoicePage = normalizePositiveInt(searchParams.get("invoicePage"), DEFAULT_INVOICE_PAGE);
		const nextInvoicePageSize = normalizePositiveInt(searchParams.get("invoicePageSize"), DEFAULT_INVOICE_PAGE_SIZE);
		const nextInvoiceField = searchParams.get("invoiceField") || DEFAULT_INVOICE_FIELD;
		const nextInvoiceSearch = searchParams.get("invoiceSearch") || "";
		const nextInvoiceSorting = parseSorting(searchParams.get("invoiceSort"));
		setActiveCustomerId((prev) => (prev === queryCustomerId ? prev : queryCustomerId));
		setActiveCustomerName((prev) => (prev === queryCustomerName ? prev : queryCustomerName));
		setActiveCycleId((prev) => (prev === queryCycleId ? prev : queryCycleId));
		const shouldUpdateInvoiceState =
			invoiceState.page !== nextInvoicePage ||
			invoiceState.pageSize !== nextInvoicePageSize ||
			invoiceState.fieldFilter !== nextInvoiceField ||
			invoiceState.searchValue !== nextInvoiceSearch ||
			serializeSorting(invoiceState.sorting) !== serializeSorting(nextInvoiceSorting);
		if (shouldUpdateInvoiceState) {
			updateInvoiceState({
				page: nextInvoicePage,
				pageSize: nextInvoicePageSize,
				fieldFilter: nextInvoiceField,
				searchValue: nextInvoiceSearch,
				sorting: nextInvoiceSorting,
			});
		}
		if (!queryCycleId) {
			setActiveCycleSnapshot(null);
		}
	}, [invoiceState.fieldFilter, invoiceState.page, invoiceState.pageSize, invoiceState.searchValue, invoiceState.sorting, searchParams, updateInvoiceState]);

	useEffect(() => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (invoiceState.page > DEFAULT_INVOICE_PAGE) next.set("invoicePage", String(invoiceState.page));
				else next.delete("invoicePage");
				if (invoiceState.pageSize !== DEFAULT_INVOICE_PAGE_SIZE) next.set("invoicePageSize", String(invoiceState.pageSize));
				else next.delete("invoicePageSize");
				if (invoiceState.fieldFilter !== DEFAULT_INVOICE_FIELD) next.set("invoiceField", invoiceState.fieldFilter);
				else next.delete("invoiceField");
				if (invoiceState.searchValue.trim()) next.set("invoiceSearch", invoiceState.searchValue);
				else next.delete("invoiceSearch");
				const sortingValue = serializeSorting(invoiceState.sorting);
				const defaultSortingValue = serializeSorting(DEFAULT_INVOICE_SORTING);
				if (sortingValue && sortingValue !== defaultSortingValue) next.set("invoiceSort", sortingValue);
				else next.delete("invoiceSort");
				return next;
			},
			{ replace: true },
		);
	}, [invoiceState.fieldFilter, invoiceState.page, invoiceState.pageSize, invoiceState.searchValue, invoiceState.sorting, setSearchParams]);

	const updateInvoiceSearchParams = useCallback(
		(next: { customerId?: string | null; customerName?: string | null; cycleId?: string | null }) => {
			setSearchParams((prev) => {
				const params = new URLSearchParams(prev);
				if (next.customerId) params.set("customerId", next.customerId);
				else params.delete("customerId");
				if (next.customerName) params.set("customerName", next.customerName);
				else params.delete("customerName");
				if (next.cycleId) params.set("cycleId", next.cycleId);
				else params.delete("cycleId");
				return params;
			});
		},
		[setSearchParams],
	);

	const handleSelectCustomer = useCallback(
		(customer: Customer | null) => {
			const nextCustomerId = customer?.id ?? null;
			const nextCustomerName = customer?.name ?? null;
			setActiveCustomerId((prev) => (prev === nextCustomerId ? prev : nextCustomerId));
			setActiveCustomerName((prev) => (prev === nextCustomerName ? prev : nextCustomerName));
			setActiveCycleSnapshot(null);
			setActiveCycleId(null);
			updateInvoiceSearchParams({
				customerId: nextCustomerId,
				customerName: nextCustomerName,
				cycleId: null,
			});
		},
		[updateInvoiceSearchParams],
	);

	const handleSelectCycle = useCallback(
		(cycle: Cycle) => {
			setActiveCycleSnapshot(cycle);
			setActiveCycleId(cycle.id);
			setActiveCustomerId((prev) => (prev === cycle.customerId ? prev : cycle.customerId));
			setActiveCustomerName((prev) => (prev === cycle.customerName ? prev : cycle.customerName));
			updateInvoiceSearchParams({
				customerId: cycle.customerId,
				customerName: cycle.customerName,
				cycleId: cycle.id,
			});
		},
		[updateInvoiceSearchParams],
	);

	const handleBackToCycles = useCallback(() => {
		setActiveCycleSnapshot(null);
		setActiveCycleId(null);
		updateInvoiceSearchParams({
			customerId: activeCustomerId,
			customerName: activeCustomerName,
			cycleId: null,
		});
	}, [activeCustomerId, activeCustomerName, updateInvoiceSearchParams]);

	// Invoice table — only used when a cycle is selected
	const invoiceTable = useInvoiceTable({
		customerName: activeCycle ? (activeCustomerName ?? activeCycle.customerName) : null,
		customerId: activeCycle ? (activeCustomerId ?? activeCycle.customerId) : null,
		cycleId: activeCycleId ?? activeCycle?.id ?? null,
	});

	const activeInvoiceLabel = activeCycle ? `${activeCustomerName ?? activeCycle.customerName}` : null;

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
				<div className="flex h-full min-h-0 w-full flex-col">
					<div className={activeCycle ? "hidden h-0 overflow-hidden" : "flex min-h-0 flex-1"}>
						<CycleContent
							customerId={activeCustomerId}
							customerName={activeCustomerName}
							onSelectCycle={handleSelectCycle}
							initialDuration={activeCustomerPaymentTermDuration}
						/>
					</div>
					<div className={activeCycle ? "flex min-h-0 flex-1" : "hidden h-0 overflow-hidden"}>
						<InvoiceContent
							{...invoiceTable}
							activeInvoiceLabel={activeInvoiceLabel}
							onBack={handleBackToCycles}
							activeCycle={activeCycle}
						/>
					</div>
				</div>
			}
		/>
	);
}
