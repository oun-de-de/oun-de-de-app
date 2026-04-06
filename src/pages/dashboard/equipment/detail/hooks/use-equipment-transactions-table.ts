import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { InventoryTransaction } from "@/core/types/inventory";
import { transactionColumns } from "../../components/transaction-columns";
import { filterRows, mapTransactionsToRows, paginateRows } from "../../utils/transaction-columns-utils";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export type TransactionPrintRow = ReturnType<typeof mapTransactionsToRows>[number];

const DEFAULT_FILTERS = {
	type: "all",
	field: "reason",
	search: "",
	page: "1",
	pageSize: "20",
} as const;

type FilterKey = keyof typeof DEFAULT_FILTERS;

export function useEquipmentTransactionsTable(itemId: string | undefined, transactions: InventoryTransaction[]) {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	// Read from URL or fall back to defaults
	const typeFilter = searchParams.get("type") ?? DEFAULT_FILTERS.type;
	const fieldFilter = searchParams.get("field") ?? DEFAULT_FILTERS.field;
	const searchValue = searchParams.get("search") ?? DEFAULT_FILTERS.search;
	const parsedPage = parseInt(searchParams.get("page") ?? "", 10);
	const page = parsedPage > 0 ? parsedPage : Number(DEFAULT_FILTERS.page);
	const parsedPageSize = parseInt(searchParams.get("pageSize") ?? "", 10);
	const pageSize = parsedPageSize > 0 ? parsedPageSize : Number(DEFAULT_FILTERS.pageSize);

	// Setters that update URL
	const setUrlParam = useCallback(
		(key: FilterKey, value: string | number, shouldResetPage = true) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					if (value && String(value) !== DEFAULT_FILTERS[key]) {
						next.set(key, String(value));
					} else {
						next.delete(key);
					}
					if (shouldResetPage && key !== "page") {
						next.delete("page");
					}
					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	const setTypeFilter = (val: string) => setUrlParam("type", val);
	const setFieldFilter = (val: string) => setUrlParam("field", val);
	const setSearchValue = (val: string) => setUrlParam("search", val);
	const setPage = (val: number) => setUrlParam("page", val, false);
	const setPageSize = (val: number) => setUrlParam("pageSize", val);

	// Derived Data
	const allRows = useMemo(() => mapTransactionsToRows(transactions), [transactions]);

	const filteredRows = useMemo(
		() => filterRows(allRows, typeFilter, fieldFilter, searchValue),
		[allRows, typeFilter, fieldFilter, searchValue],
	);

	const { pagedRows, totalItems, totalPages, currentPage } = useMemo(
		() => paginateRows(filteredRows, page, pageSize),
		[filteredRows, page, pageSize],
	);

	const handlePrintTransactionReport = useCallback(
		(row: TransactionPrintRow) => {
			if (!itemId) {
				toast.error("Unable to open print preview");
				return;
			}
			const previewUrl = `/dashboard/equipment/print-preview?itemId=${encodeURIComponent(itemId)}&txId=${encodeURIComponent(row.id)}`;
			navigate(previewUrl);
		},
		[itemId, navigate],
	);

	const columns = useMemo(
		() => transactionColumns({ onPrintReport: handlePrintTransactionReport }),
		[handlePrintTransactionReport],
	);

	return {
		columns,
		pagedRows,
		currentPage,
		totalItems,
		totalPages,
		typeFilter,
		fieldFilter,
		searchValue,
		pageSize,
		setTypeFilter,
		setFieldFilter,
		setSearchValue,
		setPage,
		setPageSize,
	};
}
