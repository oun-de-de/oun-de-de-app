import { accountingAccountList, accountingRows } from "@/_mock/data/dashboard";
import { SmartDataTable } from "@/core/components/common";
import { SplitButton } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import { useAccountingListActions } from "@/core/store/accountingListStore";
import type { SelectOption } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Text } from "@/core/ui/typography";
import { getPaginationItems } from "@/core/utils/pagination";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { columns } from "./accounting-columns";

const rows = accountingRows;

const FILTER_TYPE_OPTIONS: SelectOption[] = [
	{ value: "journal", label: "Journal Type" },
	{ value: "cash-sale", label: "Cash Sale" },
	{ value: "revenue", label: "Revenue" },
	{ value: "receipt", label: "Receipt" },
	{ value: "expense", label: "Expense" },
	{ value: "invoice", label: "Invoice" },
];

const FILTER_FIELD_OPTIONS: SelectOption[] = [
	{ value: "field-name", label: "Field name" },
	{ value: "ref-no", label: "Ref No" },
	{ value: "memo", label: "Memo" },
];

type AccountingContentProps = {
	activeAccountId: string | null;
	listState: any; // Using explicit type would be better
};

export function AccountingContent({ activeAccountId, listState }: AccountingContentProps) {
	const navigate = useNavigate();
	const { updateState } = useAccountingListActions();
	const activeAccount = accountingAccountList.find((account) => account.id === activeAccountId);
	const [inactiveAccountIds, setInactiveAccountIds] = useState<string[]>([]);
	const [showInactiveConfirm, setShowInactiveConfirm] = useState(false);
	const createOptions = [
		{ label: "Create Journal", onClick: () => navigate("/dashboard/accounting/create-journal") },
		{ label: "Create Expense", onClick: () => navigate("/dashboard/accounting/create-expense") },
		{ label: "Create Cash Transaction", onClick: () => navigate("/dashboard/accounting-center/create") },
		{ label: "Create Revenue", onClick: () => navigate("/dashboard/accounting/create-revenue") },
		{ label: "Create Chart Account", onClick: () => navigate("/dashboard/accounting/create-chart-account") },
	];
	const isActiveAccountInactive = !!activeAccountId && inactiveAccountIds.includes(activeAccountId);
	const tableData = useMemo(() => (isActiveAccountInactive ? [] : rows), [isActiveAccountInactive]);
	const totalItems = tableData.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / listState.pageSize));
	const paginationItems = getPaginationItems(listState.page, totalPages);

	const handleConfirmInactive = () => {
		if (!activeAccountId) return;
		setInactiveAccountIds((prev) => (prev.includes(activeAccountId) ? prev : [...prev, activeAccountId]));
		setShowInactiveConfirm(false);
	};

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
				<div className="flex min-w-0 items-center gap-2">
					<div className="flex items-center">
						<Button
							size="sm"
							className="rounded-r-none"
							onClick={() => navigate("/dashboard/accounting/create-chart-account")}
						>
							Chart of Account
						</Button>
						<Button
							size="icon"
							className="h-9 w-9 shrink-0 rounded-l-none border-l border-sky-300/70"
							disabled={!activeAccount}
							onClick={() => navigate(`/dashboard/accounting/edit-chart-account/${activeAccount?.id}`)}
						>
							<Icon icon="mdi:cog-outline" />
						</Button>
					</div>
					<Button
						variant="outline"
						size="icon"
						className="h-9 w-9 shrink-0"
						disabled={!activeAccount}
						onClick={() => setShowInactiveConfirm(true)}
					>
						<Icon icon="mdi:eye-off-outline" />
					</Button>
					<div className="min-w-0 pl-1">
						<Text variant="body2" className="text-slate-400">
							{activeAccount?.name ?? "No item selected"}
						</Text>
					</div>
				</div>
				<SplitButton
					size="sm"
					mainAction={{ label: "Create Cash Expense", onClick: () => navigate("/dashboard/accounting/create-expense") }}
					options={createOptions}
					mainButtonClassName="gap-2"
					triggerButtonClassName="px-2"
				/>
			</div>
			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={tableData}
				columns={columns}
				filterConfig={{
					onFilterClick: () => undefined,
					typeOptions: FILTER_TYPE_OPTIONS,
					fieldOptions: FILTER_FIELD_OPTIONS,
					typeValue: listState.typeFilter,
					fieldValue: listState.fieldFilter,
					searchValue: listState.searchValue,
					onTypeChange: (value) => updateState({ typeFilter: value, page: 1 }),
					onFieldChange: (value) => updateState({ fieldFilter: value, page: 1 }),
					onSearchChange: (value) => updateState({ searchValue: value, page: 1 }),
				}}
				paginationConfig={{
					page: listState.page,
					pageSize: listState.pageSize,
					totalItems,
					totalPages,
					paginationItems,
					onPageChange: (nextPage) => updateState({ page: nextPage }),
					onPageSizeChange: (nextSize) => updateState({ pageSize: nextSize, page: 1 }),
				}}
			/>
			<Dialog open={showInactiveConfirm} onOpenChange={setShowInactiveConfirm}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirm</DialogTitle>
					</DialogHeader>
					<div className="py-2 text-slate-700">
						Are you sure to make inactive {activeAccount?.name ?? "this account"}?
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowInactiveConfirm(false)}>
							Cancel
						</Button>
						<Button variant="info" onClick={handleConfirmInactive}>
							OK
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
