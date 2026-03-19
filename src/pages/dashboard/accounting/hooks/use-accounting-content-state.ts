import { useMemo, useState } from "react";
import { accountingRows } from "@/_mock/data/dashboard";
import { getPaginationItems } from "@/core/utils/pagination";
import { useAccountingList } from "@/core/store/accountingListStore";
import type { AccountingAccountListItem } from "../types";

type UseAccountingContentStateParams = {
	accounts: AccountingAccountListItem[];
	activeAccountId: string | null;
	listState: ReturnType<typeof useAccountingList>;
};

export function useAccountingContentState({ accounts, activeAccountId, listState }: UseAccountingContentStateParams) {
	const [inactiveAccountIds, setInactiveAccountIds] = useState<string[]>([]);
	const [showInactiveConfirm, setShowInactiveConfirm] = useState(false);

	const activeAccount = useMemo(
		() => accounts.find((account) => account.id === activeAccountId),
		[accounts, activeAccountId],
	);

	const isActiveAccountInactive = !!activeAccountId && inactiveAccountIds.includes(activeAccountId);
	const tableData = useMemo(() => (isActiveAccountInactive ? [] : accountingRows), [isActiveAccountInactive]);
	const totalItems = tableData.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / listState.pageSize));
	const paginationItems = getPaginationItems(listState.page, totalPages);

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
		totalItems,
		totalPages,
		paginationItems,
		handleConfirmInactive,
	};
}
