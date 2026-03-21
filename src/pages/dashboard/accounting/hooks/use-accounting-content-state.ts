import { useMemo, useState } from "react";
import type { AccountingRow } from "@/core/types/common";
import { getPaginationItems } from "@/core/utils/pagination";
import { useAccountingList } from "../stores/accounting-list-store";
import type { AccountingAccountListItem } from "../types";

type UseAccountingContentStateParams = {
	accounts: AccountingAccountListItem[];
	rows: AccountingRow[];
	totalItems: number;
	totalPages: number;
	activeAccountId: string | null;
	listState: ReturnType<typeof useAccountingList>;
};

export function useAccountingContentState({
	accounts,
	rows,
	totalItems,
	totalPages,
	activeAccountId,
	listState,
}: UseAccountingContentStateParams) {
	const [inactiveAccountIds, setInactiveAccountIds] = useState<string[]>([]);
	const [showInactiveConfirm, setShowInactiveConfirm] = useState(false);

	const activeAccount = useMemo(
		() => accounts.find((account) => account.id === activeAccountId),
		[accounts, activeAccountId],
	);

	const isActiveAccountInactive = !!activeAccountId && inactiveAccountIds.includes(activeAccountId);
	const tableData = isActiveAccountInactive ? [] : rows;
	const resolvedTotalPages = Math.max(1, totalPages);
	const paginationItems = getPaginationItems(listState.page, resolvedTotalPages);

	const handleConfirmInactive = () => {
		if (!activeAccountId) return;
		setInactiveAccountIds((prev) => (prev.includes(activeAccountId) ? prev : [...prev, activeAccountId]));
		setShowInactiveConfirm(false);
	};

	return {
		activeAccount,
		showInactiveConfirm,
		setShowInactiveConfirm,
		tableData,
		totalItems: isActiveAccountInactive ? 0 : totalItems,
		totalPages: isActiveAccountInactive ? 1 : resolvedTotalPages,
		paginationItems,
		handleConfirmInactive,
	};
}
