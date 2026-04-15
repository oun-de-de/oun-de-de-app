import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import customerService from "@/core/api/services/customer-service";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Customer } from "@/core/types/customer";
import { emptyPagination } from "@/core/types/pagination";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { CustomerContent } from "./components/customer-content";
import { CustomerSidebar } from "./components/customer-sidebar";
import { useCustomerListActions, useCustomerListState } from "./stores/customer-list-store";

const DEFAULT_FIELD_FILTER = "name";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const normalizePositiveInt = (value: string | null, fallback: number) => {
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export default function CustomersPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
	const listState = useCustomerListState();
	const { updateState } = useCustomerListActions();
	const { isCollapsed, handleToggle } = useSidebarCollapse();
	const urlListState = useMemo(
		() => ({
			fieldFilter: searchParams.get("field") || DEFAULT_FIELD_FILTER,
			searchValue: searchParams.get("search") || "",
			page: normalizePositiveInt(searchParams.get("page"), DEFAULT_PAGE),
			pageSize: normalizePositiveInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
		}),
		[searchParams],
	);

	useEffect(() => {
		const hasChanged =
			listState.fieldFilter !== urlListState.fieldFilter ||
			listState.searchValue !== urlListState.searchValue ||
			listState.page !== urlListState.page ||
			listState.pageSize !== urlListState.pageSize;

		if (hasChanged) {
			updateState(urlListState);
		}
	}, [
		listState.fieldFilter,
		listState.page,
		listState.pageSize,
		listState.searchValue,
		updateState,
		urlListState,
	]);

	useEffect(() => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set("field", listState.fieldFilter || DEFAULT_FIELD_FILTER);
				if (listState.searchValue.trim()) next.set("search", listState.searchValue);
				else next.delete("search");
				if (listState.page > DEFAULT_PAGE) next.set("page", String(listState.page));
				else next.delete("page");
				if (listState.pageSize !== DEFAULT_PAGE_SIZE) next.set("pageSize", String(listState.pageSize));
				else next.delete("pageSize");
				return next;
			},
			{ replace: true },
		);
	}, [listState.fieldFilter, listState.page, listState.pageSize, listState.searchValue, setSearchParams]);

	// clear active customer when user starts searching
	useEffect(() => {
		if (listState.searchValue && activeCustomer) {
			setActiveCustomer(null);
		}
	}, [listState.searchValue, activeCustomer]);

	// function to query customers list
	const { data, isLoading } = useQuery({
		queryKey: [
			"customers",
			listState.page,
			listState.pageSize,
			listState.searchValue,
			listState.fieldFilter,
			activeCustomer?.name,
		],
		queryFn: () => {
			const normalizedSearchValue = listState.searchValue.trim();
			const isPaymentTermField = listState.fieldFilter === "payment_term";
			const selectedCustomerName = activeCustomer?.name;
			const searchValue = normalizedSearchValue || undefined;
			const hasInvalidPaymentTermSearch =
				!activeCustomer && isPaymentTermField && normalizedSearchValue !== "" && !/^\d+$/.test(normalizedSearchValue);
			const paymentTermValue =
				!activeCustomer && isPaymentTermField && /^\d+$/.test(normalizedSearchValue)
					? Number(normalizedSearchValue)
					: undefined;

			if (hasInvalidPaymentTermSearch) {
				return {
					...emptyPagination<Customer>(),
					page: listState.page,
					pageSize: listState.pageSize,
					pageCount: 1,
				};
			}

			return customerService.getCustomerList({
				page: listState.page,
				limit: listState.pageSize,
				name: selectedCustomerName ?? (!isPaymentTermField ? searchValue : undefined),
				paymentTerm: paymentTermValue,
			});
		},
	});

	const customers = data?.list ?? [];
	const totalItems = data?.total ?? 0;
	const rawTotalPages = data?.pageCount ?? 0;
	const rawCurrentPage = data?.page ?? 0;
	const totalPages = rawTotalPages > 0 ? rawTotalPages : 1;
	const currentPage = rawCurrentPage > 0 ? rawCurrentPage : 1;
	const paginationItems = buildPagination(currentPage, totalPages);

	return (
		<DashboardSplitView
			isSidebarCollapsed={isCollapsed}
			sidebarClassName={isCollapsed ? "md:w-14 xl:w-14" : "md:w-[16rem] xl:w-1/5"}
			sidebar={
				<CustomerSidebar
					activeCustomerId={activeCustomer?.id || null}
					onSelect={setActiveCustomer}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
					showPaymentTermFilter={false}
				/>
			}
			content={
				<CustomerContent
					activeCustomer={activeCustomer}
					listState={listState}
					updateState={updateState}
					pagedData={customers}
					totalItems={totalItems}
					totalPages={totalPages}
					currentPage={currentPage}
					paginationItems={paginationItems}
					isLoading={isLoading}
				/>
			}
		/>
	);
}
