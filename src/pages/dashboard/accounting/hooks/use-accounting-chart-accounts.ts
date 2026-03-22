import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import accountingService from "@/core/api/services/accounting-service";
import type { AccountingAccountListItem } from "../types";
import { ACCOUNTING_QUERY_KEYS, ACCOUNTING_REFERENCE_PAGE_SIZE } from "../constants";
import { mapChartOfAccountToListItem } from "../utils/map-chart-account-result";

export function useAccountingChartAccounts() {
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
				loadAccountType: true,
				sort: "code,asc",
			}),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const items = useMemo<AccountingAccountListItem[]>(
		() =>
			(chartAccountsPagination?.list ?? []).map((account) => mapChartOfAccountToListItem(account, account.accountType)),
		[chartAccountsPagination?.list],
	);

	return {
		items,
		isLoading: isLoadingChartAccounts,
		isError,
	};
}
