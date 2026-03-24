import { useMemo, useState } from "react";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import { ACCOUNTING_ALL_TYPES_FILTER } from "../constants";
import type { AccountingAccountListItem } from "../types";

const ACCOUNTING_ACTIVE_STATUS_FILTER = "active";
const ACCOUNTING_ALL_STATUS_FILTER = "all";

type UseAccountingSidebarStateParams = {
	items: AccountingAccountListItem[];
};

export function useAccountingSidebarState({ items }: UseAccountingSidebarStateParams) {
	const [typeFilter, setTypeFilter] = useState(ACCOUNTING_ALL_TYPES_FILTER);
	const [searchValue, setSearchValue] = useState("");
	const [statusFilter, setStatusFilter] = useState(ACCOUNTING_ACTIVE_STATUS_FILTER);

	const filteredAccounts = useMemo(() => {
		return items.filter((account) => {
			if (typeFilter !== ACCOUNTING_ALL_TYPES_FILTER && account.type !== typeFilter) {
				return false;
			}

			if (searchValue) {
				const query = searchValue.toLowerCase();
				if (!account.name.toLowerCase().includes(query) && !account.code.toLowerCase().includes(query)) {
					return false;
				}
			}

			if (
				statusFilter !== ACCOUNTING_ALL_STATUS_FILTER &&
				(account.status ?? ACCOUNTING_ACTIVE_STATUS_FILTER) !== statusFilter
			) {
				return false;
			}

			return true;
		});
	}, [items, searchValue, statusFilter, typeFilter]);

	const pagination = useSidebarPagination({
		data: filteredAccounts,
		resetKey: `${typeFilter}|${searchValue}|${statusFilter}`,
	});

	return {
		pagination,
		searchValue,
		setSearchValue,
		statusFilter,
		setStatusFilter,
		typeFilter,
		setTypeFilter,
	};
}
