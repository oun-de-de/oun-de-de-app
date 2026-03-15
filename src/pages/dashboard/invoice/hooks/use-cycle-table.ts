import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import cycleService from "@/core/api/services/cycle-service";
import type { CycleStatus } from "@/core/types/cycle";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { formatKHR } from "../utils/formatters";

export function useCycleTable(customerId: string | null, requireCustomer = false) {
	const [searchValue, setSearchValue] = useState("");
	const [duration, setDuration] = useState(0);
	const [status, setStatus] = useState<CycleStatus | "all">("all");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const isQueryEnabled = requireCustomer ? !!customerId : true;
	const normalizedSearchValue = searchValue.trim().toLowerCase();
	const isSearching = normalizedSearchValue !== "";

	const query = useQuery({
		queryKey: ["cycles", customerId, fromDate, toDate, duration, status, page, pageSize],
		queryFn: () =>
			cycleService.getCycles({
				customerId: customerId ?? undefined,
				from: fromDate ? `${fromDate}T00:00:00` : undefined,
				to: toDate ? `${toDate}T23:59:59` : undefined,
				duration: duration > 0 ? duration : undefined,
				status: status === "all" ? undefined : status,
				page,
				size: pageSize,
			}),
		enabled: isQueryEnabled,
	});
	const searchQuery = useQuery({
		queryKey: ["cycles", "search", customerId, fromDate, toDate, duration, status],
		queryFn: () =>
			cycleService.getAllCycles({
				customerId: customerId ?? undefined,
				from: fromDate ? `${fromDate}T00:00:00` : undefined,
				to: toDate ? `${toDate}T23:59:59` : undefined,
				duration: duration > 0 ? duration : undefined,
				status: status === "all" ? undefined : status,
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

	const onPageChange = useCallback((value: number) => setPage(value), []);
	const onPageSizeChange = useCallback((value: number) => {
		setPageSize(value);
		setPage(1);
	}, []);

	const onDurationChange = useCallback((value: number) => {
		setDuration(value);
		setPage(1);
	}, []);

	const onStatusChange = useCallback((value: CycleStatus | "all") => {
		setStatus(value);
		setPage(1);
	}, []);
	const setCycleSearchValue = useCallback((value: string) => {
		setSearchValue(value);
		setPage(1);
	}, []);

	const onResetFilters = useCallback(() => {
		setSearchValue("");
		setDuration(0);
		setStatus("all");
		setFromDate("");
		setToDate("");
		setPage(1);
	}, []);

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
		setFromDate,
		setToDate,
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
