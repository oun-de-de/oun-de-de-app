import { useCallback, useMemo, useState } from "react";
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
	const inactiveAccountIdSet = useMemo(() => new Set(inactiveAccountIds), [inactiveAccountIds]);
	const resolvedTotalPages = Math.max(1, totalPages);

	const activeAccount = useMemo(
		() => accounts.find((account) => account.id === activeAccountId),
		[accounts, activeAccountId],
	);

	const isActiveAccountInactive = !!activeAccountId && inactiveAccountIdSet.has(activeAccountId);
	const tableData = useMemo(() => (isActiveAccountInactive ? [] : rows), [isActiveAccountInactive, rows]);
	const paginationItems = useMemo(
		() => getPaginationItems(listState.page, resolvedTotalPages),
		[listState.page, resolvedTotalPages],
	);

	const handleConfirmInactive = useCallback(() => {
		if (!activeAccountId) return;
		setInactiveAccountIds((prev) => (prev.includes(activeAccountId) ? prev : [...prev, activeAccountId]));
		setShowInactiveConfirm(false);
	}, [activeAccountId]);

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
