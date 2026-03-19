import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import accountingService from "@/core/api/services/accounting-service";
import type { AccountingAccountListItem } from "../types";
import { ACCOUNTING_QUERY_KEYS, ACCOUNTING_REFERENCE_PAGE_SIZE } from "../constants";
import { buildAccountTypeMap, mapChartOfAccountToListItem } from "../utils/map-chart-account-result";

export function useAccountingChartAccounts() {
	const { data: accountTypes = [], isLoading: isLoadingAccountTypes } = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.accountTypes,
		queryFn: () => accountingService.listAccountTypes(),
	});

	const {
		data: chartAccountsPagination,
		isLoading: isLoadingChartAccounts,
		isError,
	} = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.chartAccounts,
		queryFn: () =>
			accountingService.listChartOfAccounts({
				page: 1,
				limit: ACCOUNTING_REFERENCE_PAGE_SIZE,
				sort: "code,asc",
			}),
	});

	const accountTypeById = useMemo(() => buildAccountTypeMap(accountTypes), [accountTypes]);

	const items = useMemo<AccountingAccountListItem[]>(
		() =>
			(chartAccountsPagination?.list ?? []).map((account) =>
				mapChartOfAccountToListItem(account, accountTypeById[account.accountTypeId]),
			),
		[accountTypeById, chartAccountsPagination?.list],
	);

	return {
		items,
		isLoading: isLoadingAccountTypes || isLoadingChartAccounts,
		isError,
	};
}
