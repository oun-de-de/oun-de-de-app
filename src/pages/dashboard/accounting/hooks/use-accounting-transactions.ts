import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import cashTransactionService from "@/core/api/services/cash-transaction-service";
import type { AccountingRow } from "@/core/types/common";
import type { CashTransactionFlattenResult } from "@/core/types/cash-transaction";
import { ACCOUNTING_ALL_TYPES_FILTER, ACCOUNTING_QUERY_KEYS, ACCOUNTING_REFERENCE_PAGE_SIZE } from "../constants";

function formatAccountingDate(value?: string) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString("en-GB");
}

function mapCashTransactionToAccountingRow(item: CashTransactionFlattenResult): AccountingRow {
	return {
		date: formatAccountingDate(item.date),
		refNo: item.refNo,
		type: item.type,
		reason: item.reason?.trim() || item.type,
		currency: item.currency ?? "-",
		memo: item.memo ?? "",
		dr: item.type === "DEBIT" ? String(item.amount ?? 0) : "0",
		cr: item.type === "CREDIT" ? String(item.amount ?? 0) : "0",
	};
}

type UseAccountingTransactionsParams = {
	page: number;
	pageSize: number;
	typeFilter: string;
	fieldFilter: string;
	searchValue: string;
};

function filterRows(rows: AccountingRow[], typeFilter: string, fieldFilter: string, searchValue: string) {
	let nextRows = rows;

	if (typeFilter !== ACCOUNTING_ALL_TYPES_FILTER) {
		nextRows = nextRows.filter((row) => row.type.toLowerCase() === typeFilter.toLowerCase());
	}

	const normalizedSearch = searchValue.trim().toLowerCase();
	if (!normalizedSearch) {
		return nextRows;
	}

	return nextRows.filter((row) => {
		if (fieldFilter === "ref-no") {
			return row.refNo.toLowerCase().includes(normalizedSearch);
		}
		if (fieldFilter === "memo") {
			return row.memo.toLowerCase().includes(normalizedSearch);
		}
		return row.refNo.toLowerCase().includes(normalizedSearch) || row.memo.toLowerCase().includes(normalizedSearch);
	});
}

export function useAccountingTransactions({
	page,
	pageSize,
	typeFilter,
	fieldFilter,
	searchValue,
}: UseAccountingTransactionsParams) {
	const normalizedSearchValue = searchValue.trim();
	const shouldFilterClientSide = typeFilter !== ACCOUNTING_ALL_TYPES_FILTER || normalizedSearchValue !== "";
	const resolvedFieldFilter = normalizedSearchValue ? fieldFilter : "all";

	const { data, isLoading, isError } = useQuery({
		queryKey: [
			...ACCOUNTING_QUERY_KEYS.cashTransactions,
			page,
			pageSize,
			typeFilter,
			resolvedFieldFilter,
			normalizedSearchValue,
		],
		queryFn: () =>
			cashTransactionService.listCashTransactions({
				page: 1,
				limit: ACCOUNTING_REFERENCE_PAGE_SIZE,
			}),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const rows = useMemo<AccountingRow[]>(() => {
		const mappedRows = (data?.list ?? []).map(mapCashTransactionToAccountingRow);
		const filteredRows = shouldFilterClientSide
			? filterRows(mappedRows, typeFilter, resolvedFieldFilter, normalizedSearchValue)
			: mappedRows;
		const startIndex = (page - 1) * pageSize;
		return filteredRows.slice(startIndex, startIndex + pageSize);
	}, [data?.list, normalizedSearchValue, page, pageSize, resolvedFieldFilter, shouldFilterClientSide, typeFilter]);

	const filteredTotalItems = useMemo(() => {
		if (!shouldFilterClientSide) {
			return data?.total ?? 0;
		}

		return filterRows(
			(data?.list ?? []).map(mapCashTransactionToAccountingRow),
			typeFilter,
			resolvedFieldFilter,
			normalizedSearchValue,
		).length;
	}, [data?.list, data?.total, normalizedSearchValue, resolvedFieldFilter, shouldFilterClientSide, typeFilter]);

	return {
		rows,
		page: data?.page ?? page,
		pageSize: data?.pageSize ?? pageSize,
		totalItems: filteredTotalItems,
		totalPages: Math.max(1, Math.ceil(filteredTotalItems / pageSize)),
		isLoading,
		isError,
	};
}
