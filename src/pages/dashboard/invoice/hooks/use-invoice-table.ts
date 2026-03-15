import { useQuery } from "@tanstack/react-query";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import isEqual from "fast-deep-equal";
import { useCallback, useEffect, useMemo } from "react";
import invoiceService from "@/core/api/services/invoice-service";
import { useDebounce } from "@/core/hooks/use-debounce";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { getInvoiceState, useInvoiceActions, useInvoiceState } from "../stores/invoice-store";

type UseInvoiceTableParams = {
	customerName?: string | null;
	customerId?: string | null;
	cycleId?: string | null;
};

const getCurrentListState = () => getInvoiceState();

export function useInvoiceTable({ customerName, customerId, cycleId }: UseInvoiceTableParams = {}) {
	const { page, pageSize, fieldFilter, searchValue, sorting } = useInvoiceState();
	const { updateState } = useInvoiceActions();

	const debouncedSearchValue = useDebounce(searchValue, 300);
	const isSearching = debouncedSearchValue.trim() !== "";

	const query = useQuery({
		queryKey: [
			"invoices",
			{
				page,
				size: pageSize,
				search: debouncedSearchValue,
				field: fieldFilter,
				customerName,
				customerId,
				cycleId,
				sorting,
			},
		],
		queryFn: () => {
			const sortParam = sorting.map((s) => `${s.id},${s.desc ? "desc" : "asc"}`).join(",");

			if (isSearching) {
				return invoiceService
					.getAllInvoices({
						size: 1000,
						customerId: customerId || undefined,
						cycleId: cycleId || undefined,
						sort: sortParam || "date,desc",
					})
					.then((list) => ({
						list,
						page: 1,
						pageSize: list.length || pageSize,
						pageCount: 1,
						total: list.length,
					}));
			}

			return invoiceService.getInvoices({
				page: page,
				size: pageSize,
				customerId: customerId || undefined,
				cycleId: cycleId || undefined,
				sort: sortParam || "date,desc",
			});
		},
	});

	const invoicePage = query.data;
	const invoices = useMemo(() => {
		const list = invoicePage?.list ?? [];
		const query = debouncedSearchValue.trim().toLowerCase();
		if (!query) return list;

		return list.filter((invoice) => {
			const refNo = (invoice.refNo ?? "").toLowerCase();
			const nextCustomerName = (invoice.customerName ?? "").toLowerCase();

			if (fieldFilter === "refNo") return refNo.includes(query);
			if (fieldFilter === "customerName") return nextCustomerName.includes(query);
			return refNo.includes(query) || nextCustomerName.includes(query);
		});
	}, [debouncedSearchValue, fieldFilter, invoicePage?.list]);
	const searchTotalPages = Math.max(1, Math.ceil(invoices.length / pageSize));
	const totalPages = isSearching ? searchTotalPages : Math.max(1, invoicePage?.pageCount ?? 0);
	const currentPage = Math.min(page, totalPages);

	useEffect(() => {
		if (page > totalPages) {
			updateState({ page: totalPages });
		}
	}, [page, totalPages, updateState]);

	const pagedData = useMemo(() => {
		if (!isSearching) return invoices;

		const start = (currentPage - 1) * pageSize;
		return invoices.slice(start, start + pageSize);
	}, [currentPage, invoices, isSearching, pageSize]);

	const summaryCards = useMemo(() => {
		const totalInvoice = isSearching ? invoices.length : (invoicePage?.total ?? invoices.length);

		return [{ label: "Total Invoice", value: totalInvoice, color: "bg-sky-500", icon: "mdi:file-document-outline" }];
	}, [invoicePage?.total, invoices, isSearching]);

	const onFieldFilterChange = useCallback(
		(value: string) => {
			const current = getCurrentListState();
			const shouldResetSearch = current.searchValue !== "";
			if (value === current.fieldFilter && current.page === 1 && !shouldResetSearch) return;
			updateState({ fieldFilter: value, searchValue: "", page: 1 });
		},
		[updateState],
	);

	const onSearchChange = useCallback(
		(value: string) => {
			const current = getCurrentListState();
			if (value === current.searchValue && current.page === 1) return;
			updateState({ searchValue: value, page: 1 });
		},
		[updateState],
	);

	const onPageChange = useCallback(
		(value: number) => {
			const current = getCurrentListState();
			if (value === current.page) return;
			updateState({ page: value });
		},
		[updateState],
	);

	const onPageSizeChange = useCallback(
		(value: number) => {
			const current = getCurrentListState();
			if (value === current.pageSize && current.page === 1) return;
			updateState({ pageSize: value, page: 1 });
		},
		[updateState],
	);

	const onSortingChange: OnChangeFn<SortingState> = useCallback(
		(updaterOrValue) => {
			const current = getCurrentListState();
			const nextSorting = typeof updaterOrValue === "function" ? updaterOrValue(current.sorting) : updaterOrValue;
			if (isEqual(nextSorting, current.sorting)) return;
			updateState({ sorting: nextSorting });
		},
		[updateState],
	);

	return {
		pagedData,
		summaryCards,
		fieldFilter,
		searchValue,
		currentPage,
		pageSize,
		totalItems: isSearching ? invoices.length : (invoicePage?.total ?? 0),
		totalPages,
		paginationItems: buildPagination(currentPage, totalPages),
		sorting,
		onFieldFilterChange,
		onSearchChange,
		onPageChange,
		onPageSizeChange,
		onSortingChange,
		isLoading: query.isLoading,
		isError: query.isError,
		refetch: query.refetch,
	};
}
