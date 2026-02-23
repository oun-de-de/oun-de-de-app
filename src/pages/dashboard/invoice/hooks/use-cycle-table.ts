import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import cycleService from "@/core/api/services/cycle-service";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { formatDateToYYYYMMDD } from "@/core/utils/date-utils";

function getDefaultFromDate(): string {
	const date = new Date();
	date.setFullYear(date.getFullYear() - 1);
	return formatDateToYYYYMMDD(date);
}

function getDefaultToDate(): string {
	return formatDateToYYYYMMDD(new Date());
}

export function useCycleTable(customerId: string | null, requireCustomer = false) {
	const [duration, setDuration] = useState(1);
	const [fromDate, setFromDate] = useState(getDefaultFromDate);
	const [toDate, setToDate] = useState(getDefaultToDate);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(100);
	const isQueryEnabled = requireCustomer ? !!customerId : true;

	const query = useQuery({
		queryKey: ["cycles", customerId, fromDate, toDate, duration, page, pageSize],
		queryFn: () =>
			cycleService.getCycles({
				customerId: customerId ?? undefined,
				from: `${fromDate}T00:00:00`,
				to: `${toDate}T23:59:59`,
				duration,
				page,
				size: pageSize,
			}),
		enabled: isQueryEnabled,
	});

	const cycles = query.data?.list ?? [];
	const totalItems = query.data?.total ?? 0;
	const totalPages = Math.max(1, query.data?.pageCount ?? 0);
	const currentPage = Math.min(page, totalPages);
	const paginationItems = buildPagination(currentPage, totalPages);

	const onPageChange = useCallback((value: number) => setPage(value), []);
	const onPageSizeChange = useCallback((value: number) => {
		setPageSize(value);
		setPage(1);
	}, []);

	const onDurationChange = useCallback((value: number) => {
		setDuration(value);
		setPage(1);
	}, []);

	const summaryCards = useMemo(() => {
		const totalAmount = cycles.reduce((sum, cycle) => sum + (cycle.totalAmount ?? 0), 0);
		const totalPaidAmount = cycles.reduce((sum, cycle) => sum + (cycle.totalPaidAmount ?? 0), 0);
		const totalBalance = totalAmount - totalPaidAmount;

		return [
			{ label: "Total Cycles", value: totalItems, color: "bg-sky-500", icon: "mdi:calendar-clock" },
			{ label: "Duration (days)", value: duration, color: "bg-violet-500", icon: "mdi:timer-outline" },
			{ label: "Total Amount", value: totalAmount, color: "bg-emerald-500", icon: "mdi:cash" },
			{ label: "Balance", value: totalBalance, color: "bg-amber-500", icon: "mdi:cash-refund" },
		];
	}, [cycles, totalItems, duration]);

	return {
		cycles,
		summaryCards,
		duration,
		fromDate,
		toDate,
		setFromDate,
		setToDate,
		onDurationChange,
		currentPage,
		pageSize,
		totalItems,
		totalPages,
		paginationItems,
		onPageChange,
		onPageSizeChange,
		isLoading: query.isLoading,
	};
}
