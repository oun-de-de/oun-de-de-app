import { useCallback, useEffect, useMemo, useState } from "react";

type UseSidebarPaginationProps<T> = {
	data: T[];
	enabled?: boolean;
	pageSize?: number;
};

export function useSidebarPagination<T>({ data, enabled = true, pageSize = 20 }: UseSidebarPaginationProps<T>) {
	const [page, setPage] = useState(1);

	// Auto-clamp/reset page when switching between enabled/disabled (desktop/mobile)
	// or when enabled becomes true but current page is out of bounds
	const total = data.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	useEffect(() => {
		if (enabled && page > totalPages) {
			setPage(totalPages);
		}
	}, [enabled, page, totalPages]);

	const handlePrev = useCallback(() => {
		if (!enabled) return;
		setPage((p) => Math.max(1, p - 1));
	}, [enabled]);

	const handleNext = useCallback(() => {
		if (!enabled) return;
		setPage((p) => Math.min(totalPages, p + 1));
	}, [enabled, totalPages]);

	const pagedData = useMemo(() => {
		if (!enabled) return data;
		const start = (page - 1) * pageSize;
		return data.slice(start, start + pageSize);
	}, [data, enabled, page, pageSize]);

	return {
		page,
		totalPages,
		total,
		hasPrev: page > 1,
		hasNext: page < totalPages,
		handlePrev,
		handleNext,
		pagedData,
	};
}
