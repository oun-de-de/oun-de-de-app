import { useQuery } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import customerService from "@/core/api/services/customer-service";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";
import type { Customer } from "@/core/types/customer";
import type { Cycle } from "@/core/types/cycle";
import { normalizePositiveInt } from "@/core/utils/normalize";
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

type InvoiceSearchState = {
	customerId: string | null;
	customerName: string | null;
	cycleId: string | null;
	page: number;
	pageSize: number;
	fieldFilter: string;
	searchValue: string;
	sorting: SortingState;
};

const parseInvoiceSearchParams = (searchParams: URLSearchParams) => ({
	customerId: searchParams.get("customerId"),
	customerName: searchParams.get("customerName"),
	cycleId: searchParams.get("cycleId"),
	page: normalizePositiveInt(searchParams.get("invoicePage"), DEFAULT_INVOICE_PAGE),
	pageSize: normalizePositiveInt(searchParams.get("invoicePageSize"), DEFAULT_INVOICE_PAGE_SIZE),
	fieldFilter: searchParams.get("invoiceField") || DEFAULT_INVOICE_FIELD,
	searchValue: searchParams.get("invoiceSearch") || "",
	sorting: parseSorting(searchParams.get("invoiceSort")),
});

const setNullableSearchParam = (searchParams: URLSearchParams, key: string, value: string | null | undefined) => {
	if (value) searchParams.set(key, value);
	else searchParams.delete(key);
};

const isInvoiceTableStateEqual = (
	left: Pick<InvoiceSearchState, "page" | "pageSize" | "fieldFilter" | "searchValue" | "sorting">,
	right: Pick<InvoiceSearchState, "page" | "pageSize" | "fieldFilter" | "searchValue" | "sorting">,
) =>
	left.page === right.page &&
	left.pageSize === right.pageSize &&
	left.fieldFilter === right.fieldFilter &&
	left.searchValue === right.searchValue &&
	serializeSorting(left.sorting) === serializeSorting(right.sorting);

const buildInvoiceSearchParams = (
	searchParams: URLSearchParams,
	invoiceState: {
		page: number;
		pageSize: number;
		fieldFilter: string;
		searchValue: string;
		sorting: SortingState;
	},
) => {
	const next = new URLSearchParams(searchParams);
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
};

export default function InvoicePage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [activeCustomerId, setActiveCustomerId] = useState<string | null>(() => searchParams.get("customerId"));
	const [activeCustomerName, setActiveCustomerName] = useState<string | null>(() => searchParams.get("customerName"));
	const [activeCycleSnapshot, setActiveCycleSnapshot] = useState<Cycle | null>(null);
	const [activeCycleId, setActiveCycleId] = useState<string | null>(() => searchParams.get("cycleId"));
	const { isCollapsed, handleToggle } = useSidebarCollapse();
	const invoiceState = useInvoiceState();
	const invoiceStateRef = useRef(invoiceState);
	const { updateState: updateInvoiceState } = useInvoiceActions();
	const { fieldFilter, page, pageSize, searchValue, sorting } = invoiceState;
	const { data: activeCycleDetail } = useCycleDetail(activeCycleId);
	const { data: activeCustomerDetail } = useQuery({
		queryKey: CUSTOMER_QUERY_KEYS.detail(activeCustomerId ?? undefined),
		queryFn: () => customerService.getCustomer(activeCustomerId ?? ""),
		enabled: !!activeCustomerId,
	});
	const activeCycle = activeCycleDetail ?? activeCycleSnapshot;
	const activeCustomerPaymentTermDuration = activeCustomerDetail?.paymentTerm?.duration ?? null;
	const parsedInvoiceSearchParams = useMemo(() => parseInvoiceSearchParams(searchParams), [searchParams]);

	useEffect(() => {
		invoiceStateRef.current = invoiceState;
	}, [invoiceState]);

	useEffect(() => {
		const currentInvoiceState = invoiceStateRef.current;
		setActiveCustomerId((prev) =>
			prev === parsedInvoiceSearchParams.customerId ? prev : parsedInvoiceSearchParams.customerId,
		);
		setActiveCustomerName((prev) =>
			prev === parsedInvoiceSearchParams.customerName ? prev : parsedInvoiceSearchParams.customerName,
		);
		setActiveCycleId((prev) => (prev === parsedInvoiceSearchParams.cycleId ? prev : parsedInvoiceSearchParams.cycleId));
		if (
			!isInvoiceTableStateEqual(
				{
					page: currentInvoiceState.page,
					pageSize: currentInvoiceState.pageSize,
					fieldFilter: currentInvoiceState.fieldFilter,
					searchValue: currentInvoiceState.searchValue,
					sorting: currentInvoiceState.sorting,
				},
				parsedInvoiceSearchParams,
			)
		) {
			updateInvoiceState({
				page: parsedInvoiceSearchParams.page,
				pageSize: parsedInvoiceSearchParams.pageSize,
				fieldFilter: parsedInvoiceSearchParams.fieldFilter,
				searchValue: parsedInvoiceSearchParams.searchValue,
				sorting: parsedInvoiceSearchParams.sorting,
			});
		}
		if (!parsedInvoiceSearchParams.cycleId) {
			setActiveCycleSnapshot(null);
		}
	}, [parsedInvoiceSearchParams, updateInvoiceState]);

	useEffect(() => {
		setSearchParams(
			(prev) => {
				const next = buildInvoiceSearchParams(prev, { fieldFilter, page, pageSize, searchValue, sorting });
				return next.toString() === prev.toString() ? prev : next;
			},
			{ replace: true },
		);
	}, [fieldFilter, page, pageSize, searchValue, sorting, setSearchParams]);

	const updateInvoiceSearchParams = useCallback(
		(next: { customerId?: string | null; customerName?: string | null; cycleId?: string | null }) => {
			setSearchParams(
				(prev) => {
					const params = new URLSearchParams(prev);
					setNullableSearchParam(params, "customerId", next.customerId);
					setNullableSearchParam(params, "customerName", next.customerName);
					setNullableSearchParam(params, "cycleId", next.cycleId);
					return params;
				},
				{ replace: true },
			);
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
			updateInvoiceSearchParams({
				customerId: activeCustomerId,
				customerName: activeCustomerName,
				cycleId: cycle.id,
			});
		},
		[activeCustomerId, activeCustomerName, updateInvoiceSearchParams],
	);

	const handleBackToCycles = useCallback(() => {
		setActiveCycleSnapshot(null);
		setActiveCycleId(null);
		setActiveCustomerId(null);
		setActiveCustomerName(null);
		updateInvoiceSearchParams({
			customerId: null,
			customerName: null,
			cycleId: null,
		});
	}, [updateInvoiceSearchParams]);

	// Invoice table — only used when a cycle is selected
	const invoiceTable = useInvoiceTable({
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
