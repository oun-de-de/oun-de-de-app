import { useQuery } from "@tanstack/react-query";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import isEqual from "fast-deep-equal";
import { useCallback, useEffect, useMemo } from "react";
import invoiceService from "@/core/api/services/invoice-service";
import { useDebounce } from "@/core/hooks/use-debounce";
import type { InvoiceType } from "@/core/types/invoice";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { getInvoiceState, useInvoiceActions, useInvoiceState } from "../stores/invoice-store";
import { isInvoiceType } from "../utils/formatters";

type UseInvoiceTableParams = {
	customerName?: string | null;
	customerId?: string | null;
	cycleId?: string | null;
};

const getCurrentListState = () => getInvoiceState();

export function useInvoiceTable({ customerName, customerId, cycleId }: UseInvoiceTableParams = {}) {
	const { page, pageSize, typeFilter, fieldFilter, searchValue, sorting } = useInvoiceState();
	const { updateState } = useInvoiceActions();

	const debouncedSearchValue = useDebounce(searchValue, 300);

	const query = useQuery({
		queryKey: [
			"invoices",
			{
				page,
				size: pageSize,
				type: typeFilter,
				search: debouncedSearchValue,
				field: fieldFilter,
				customerName,
				customerId,
				cycleId,
				sorting,
			},
		],
		queryFn: () => {
			let searchRefNo: string | undefined;
			let searchCustomerName: string | undefined;
			let searchType: InvoiceType | undefined;

			if (fieldFilter === "type" && debouncedSearchValue) {
				const normalized = debouncedSearchValue.toLowerCase();
				searchType = isInvoiceType(normalized) ? normalized : undefined;
			} else if (fieldFilter === "refNo") {
				searchRefNo = debouncedSearchValue;
			} else if (fieldFilter === "customerName") {
				searchCustomerName = debouncedSearchValue;
			} else if (debouncedSearchValue) {
				searchRefNo = debouncedSearchValue;
				searchCustomerName = debouncedSearchValue;
			}

			const sortParam = sorting.map((s) => `${s.id},${s.desc ? "desc" : "asc"}`).join(",");
			const selectedType = isInvoiceType(typeFilter) ? typeFilter : undefined;

			return invoiceService.getInvoices({
				page: page,
				size: pageSize,
				type: searchType ?? selectedType,
				refNo: searchRefNo,
				customerName: (customerName ?? searchCustomerName) || undefined,
				customerId: customerId || undefined,
				cycleId: cycleId || undefined,
				sort: sortParam || "date,desc",
			});
		},
	});

	const invoicePage = query.data;
	const invoices = invoicePage?.list ?? [];
	const totalPages = Math.max(1, invoicePage?.pageCount ?? 0);
	const currentPage = Math.min(page, totalPages);

	useEffect(() => {
		if (page > totalPages) {
			updateState({ page: totalPages });
		}
	}, [page, totalPages, updateState]);

	const pagedData = useMemo(() => invoices, [invoices]);

	const summaryCards = useMemo(() => {
		const totalInvoice = invoicePage?.total ?? invoices.length;

		return [{ label: "Total Invoice", value: totalInvoice, color: "bg-sky-500", icon: "mdi:file-document-outline" }];
	}, [invoicePage?.total, invoices]);

	const onTypeFilterChange = useCallback(
		(value: string) => {
			const current = getCurrentListState();
			const shouldResetSearch = value === "all" && current.searchValue !== "";
			if (value === current.typeFilter && current.page === 1 && !shouldResetSearch) return;
			updateState({
				typeFilter: value,
				searchValue: value === "all" ? "" : current.searchValue,
				page: 1,
			});
		},
		[updateState],
	);

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
		typeFilter,
		fieldFilter,
		searchValue,
		currentPage,
		pageSize,
		totalItems: invoicePage?.total ?? 0,
		totalPages,
		paginationItems: buildPagination(currentPage, totalPages),
		sorting,
		onTypeFilterChange,
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
