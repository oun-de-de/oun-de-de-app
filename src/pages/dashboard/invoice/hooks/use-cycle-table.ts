import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useDebounce } from "@/core/hooks/use-debounce";
import cycleService from "@/core/api/services/cycle-service";
import type { CycleStatus } from "@/core/types/cycle";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { formatKHR } from "../utils/formatters";

const DEFAULT_CYCLE_SORT = "startDate,desc";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const CYCLE_SEARCH_KEY = "cycleSearch";

export function useCycleTable(customerId: string | null, requireCustomer = false, initialDuration?: number | null) {
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchValue, setSearchValue] = useState(() => searchParams.get(CYCLE_SEARCH_KEY) ?? "");
	const [duration, setDuration] = useState(() => (initialDuration && initialDuration > 0 ? initialDuration : 0));
	const [status, setStatus] = useState<CycleStatus | "all">("all");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [page, setPage] = useState(DEFAULT_PAGE);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const previousCustomerIdRef = useRef<string | null>(customerId);
	const isQueryEnabled = requireCustomer ? !!customerId : true;
	const normalizedSearchValue = searchValue.trim().toLowerCase();
	const debouncedSearchValue = useDebounce(searchValue, 300);
	const isSearching = normalizedSearchValue !== "";
	const cycleQueryParams = useMemo(
		() => ({
			customerId: customerId ?? undefined,
			from: fromDate ? `${fromDate}T00:00:00` : undefined,
			to: toDate ? `${toDate}T23:59:59` : undefined,
			duration: duration > 0 ? duration : undefined,
			status: status === "all" ? undefined : status,
			sort: DEFAULT_CYCLE_SORT,
		}),
		[customerId, duration, fromDate, status, toDate],
	);

	const updateCycleSearchParam = useCallback(
		(value: string) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					if (value.trim()) next.set(CYCLE_SEARCH_KEY, value);
					else next.delete(CYCLE_SEARCH_KEY);
					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	useEffect(() => {
		const nextSearchValue = searchParams.get(CYCLE_SEARCH_KEY) ?? "";
		setSearchValue((current) => (current === nextSearchValue ? current : nextSearchValue));
	}, [searchParams]);

	useEffect(() => {
		const currentSearchParam = searchParams.get(CYCLE_SEARCH_KEY) ?? "";
		if (debouncedSearchValue !== searchValue) return;
		if (debouncedSearchValue === currentSearchParam) return;
		updateCycleSearchParam(debouncedSearchValue);
	}, [debouncedSearchValue, searchParams, searchValue, updateCycleSearchParam]);

	useEffect(() => {
		if (previousCustomerIdRef.current === customerId) return;

		previousCustomerIdRef.current = customerId;
		setSearchValue("");
		setDuration(initialDuration && initialDuration > 0 ? initialDuration : 0);
		setStatus("all");
		setFromDate("");
		setToDate("");
		setPage(DEFAULT_PAGE);
		setPageSize(DEFAULT_PAGE_SIZE);
		updateCycleSearchParam("");
	}, [customerId, initialDuration, updateCycleSearchParam]);

	const query = useQuery({
		queryKey: ["cycles", customerId, fromDate, toDate, duration, status, page, pageSize],
		queryFn: () =>
			cycleService.getCycles({
				...cycleQueryParams,
				page,
				size: pageSize,
			}),
		enabled: isQueryEnabled,
	});
	const searchQuery = useQuery({
		queryKey: ["cycles", "search", customerId, fromDate, toDate, duration, status],
		queryFn: () =>
			cycleService.getAllCycles({
				...cycleQueryParams,
			}),
		enabled: isQueryEnabled && isSearching,
	});

	const searchedCycles = useMemo(
		() => (searchQuery.data ?? []).filter((cycle) => cycle.customerName.toLowerCase().includes(normalizedSearchValue)),
		[normalizedSearchValue, searchQuery.data],
	);
	const totalItems = isSearching ? searchedCycles.length : (query.data?.total ?? 0);
	const totalPages = isSearching
		? Math.max(1, Math.ceil(totalItems / pageSize))
		: Math.max(1, query.data?.pageCount ?? 0);
	const currentPage = Math.min(page, totalPages);
	const paginationItems = buildPagination(currentPage, totalPages);
	const cycles = useMemo(() => {
		if (!isSearching) return query.data?.list ?? [];

		const start = (currentPage - 1) * pageSize;
		return searchedCycles.slice(start, start + pageSize);
	}, [currentPage, isSearching, pageSize, query.data?.list, searchedCycles]);
	const summarySourceCycles = isSearching ? searchedCycles : (query.data?.list ?? []);

	const onPageChange = useCallback((value: number) => {
		setPage(value);
	}, []);
	const onPageSizeChange = useCallback((value: number) => {
		setPageSize(value);
		setPage(DEFAULT_PAGE);
	}, []);

	const onDurationChange = useCallback((value: number) => {
		setDuration(value);
		setPage(DEFAULT_PAGE);
	}, []);

	const onStatusChange = useCallback((value: CycleStatus | "all") => {
		setStatus(value);
		setPage(DEFAULT_PAGE);
	}, []);
	const setCycleSearchValue = useCallback((value: string) => {
		setSearchValue(value);
		setPage(DEFAULT_PAGE);
	}, []);

	const setCycleFromDate = useCallback((value: string) => {
		setFromDate(value);
		setPage(DEFAULT_PAGE);
	}, []);

	const setCycleToDate = useCallback((value: string) => {
		setToDate(value);
		setPage(DEFAULT_PAGE);
	}, []);

	const onResetFilters = useCallback(() => {
		setSearchValue("");
		setDuration(0);
		setStatus("all");
		setFromDate("");
		setToDate("");
		setPage(DEFAULT_PAGE);
		setPageSize(DEFAULT_PAGE_SIZE);
		updateCycleSearchParam("");
	}, [updateCycleSearchParam]);

	const summaryCards = useMemo(() => {
		const totalAmount = summarySourceCycles.reduce((sum, cycle) => sum + (cycle.totalAmount ?? 0), 0);
		const totalPaidAmount = summarySourceCycles.reduce((sum, cycle) => sum + (cycle.totalPaidAmount ?? 0), 0);
		const totalBalance = totalAmount - totalPaidAmount;

		return [
			{ label: "Total Cycles", value: totalItems, color: "bg-sky-500", icon: "mdi:calendar-clock" },
			{
				label: duration > 0 ? "Duration (days)" : "Duration (All)",
				value: duration,
				color: "bg-slate-500",
				icon: "mdi:timer-outline",
			},
			{ label: "Total Amount", value: formatKHR(totalAmount), color: "bg-emerald-500", icon: "mdi:cash" },
			{ label: "Balance", value: formatKHR(totalBalance), color: "bg-amber-500", icon: "mdi:cash-refund" },
		];
	}, [duration, summarySourceCycles, totalItems]);

	return {
		cycles,
		summaryCards,
		searchValue,
		setSearchValue: setCycleSearchValue,
		duration,
		status,
		fromDate,
		toDate,
		setFromDate: setCycleFromDate,
		setToDate: setCycleToDate,
		onDurationChange,
		onStatusChange,
		onResetFilters,
		currentPage,
		pageSize,
		totalItems,
		totalPages,
		paginationItems,
		onPageChange,
		onPageSizeChange,
		isLoading: query.isLoading || searchQuery.isLoading,
	};
}
