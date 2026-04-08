import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import cashTransactionService from "@/core/api/services/cash-transaction-service";
import type { AccountingRow } from "@/core/types/common";
import type { CashTransactionFlattenResult } from "@/core/types/cash-transaction";
import {
	ACCOUNTING_ALL_TYPES_FILTER,
	ACCOUNTING_FILTER_PAGE_SIZE,
	ACCOUNTING_QUERY_KEYS,
} from "../constants";

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
	const requestedLimit = shouldFilterClientSide ? ACCOUNTING_FILTER_PAGE_SIZE : pageSize;
	const requestedPage = shouldFilterClientSide ? 1 : page;

	const { data, isLoading, isError } = useQuery({
		queryKey: [
			...ACCOUNTING_QUERY_KEYS.cashTransactions,
			requestedPage,
			requestedLimit,
			typeFilter,
			resolvedFieldFilter,
			normalizedSearchValue,
		],
		queryFn: () =>
			cashTransactionService.listCashTransactions({
				page: requestedPage,
				limit: requestedLimit,
			}),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const mappedRows = useMemo(
		() => (data?.list ?? []).map(mapCashTransactionToAccountingRow),
		[data?.list],
	);

	const filteredRows = useMemo(() => {
		if (!shouldFilterClientSide) {
			return mappedRows;
		}

		return filterRows(mappedRows, typeFilter, resolvedFieldFilter, normalizedSearchValue);
	}, [mappedRows, normalizedSearchValue, resolvedFieldFilter, shouldFilterClientSide, typeFilter]);

	const rows = useMemo<AccountingRow[]>(() => {
		if (!shouldFilterClientSide) {
			return filteredRows;
		}

		const startIndex = (page - 1) * pageSize;
		return filteredRows.slice(startIndex, startIndex + pageSize);
	}, [filteredRows, page, pageSize, shouldFilterClientSide]);

	const totalItems = shouldFilterClientSide ? filteredRows.length : (data?.total ?? 0);
	const totalPages = shouldFilterClientSide
		? Math.max(1, Math.ceil(totalItems / pageSize))
		: (data?.pageCount ?? Math.max(1, Math.ceil(totalItems / pageSize)));

	return {
		rows,
		page: shouldFilterClientSide ? page : (data?.page ?? page),
		pageSize: shouldFilterClientSide ? pageSize : (data?.pageSize ?? pageSize),
		totalItems,
		totalPages,
		isLoading,
		isError,
	};
}
