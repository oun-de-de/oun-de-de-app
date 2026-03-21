import { SmartDataTable } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Text } from "@/core/ui/typography";
import { useNavigate } from "react-router";
import { columns } from "./accounting-columns";
import {
	ACCOUNTING_CREATE_OPTION_TARGETS,
	ACCOUNTING_TABLE_FIELD_OPTIONS,
	ACCOUNTING_TABLE_TYPE_OPTIONS,
	ACCOUNTING_UI_TEXT,
	createAccountingCreateMainAction,
} from "../constants";
import { AccountingCreateMenuButton } from "./accounting-create-menu-button";
import { useAccountingContentState } from "../hooks/use-accounting-content-state";
import { useAccountingList, useAccountingListActions } from "../stores/accounting-list-store";
import type { AccountingAccountListItem } from "../types";
import type { AccountingRow } from "@/core/types/common";

type AccountingContentProps = {
	accounts: AccountingAccountListItem[];
	rows: AccountingRow[];
	totalItems: number;
	totalPages: number;
	activeAccountId: string | null;
	listState: ReturnType<typeof useAccountingList>;
};

export function AccountingContent({
	accounts,
	rows,
	totalItems: serverTotalItems,
	totalPages: serverTotalPages,
	activeAccountId,
	listState,
}: AccountingContentProps) {
	const navigate = useNavigate();
	const { updateState } = useAccountingListActions();
	const {
		activeAccount,
		handleConfirmInactive,
		paginationItems,
		setShowInactiveConfirm,
		showInactiveConfirm,
		tableData,
		totalItems,
		totalPages,
	} = useAccountingContentState({
		accounts,
		rows,
		totalItems: serverTotalItems,
		totalPages: serverTotalPages,
		activeAccountId,
		listState,
	});

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
				<div className="flex min-w-0 items-center gap-2">
					<div className="flex items-center">
						<Button
							type="button"
							size="sm"
							className="rounded-r-none px-3 text-sm font-medium"
							onClick={() => navigate("/dashboard/accounting/create-chart-account")}
							title={ACCOUNTING_UI_TEXT.createChartAccount}
						>
							{ACCOUNTING_UI_TEXT.headerLabel}
						</Button>
						<Button
							type="button"
							size="sm"
							className="shrink-0 rounded-l-none border-l border-sky-300/70"
							disabled={!activeAccount}
							onClick={() => navigate(`/dashboard/accounting/edit-chart-account/${activeAccount?.id}`)}
							aria-label={ACCOUNTING_UI_TEXT.viewSelectedAccountTitle}
							title={ACCOUNTING_UI_TEXT.viewSelectedAccountTitle}
						>
							<Icon icon="mdi:eye-outline" />
						</Button>
					</div>
					<Button
						variant="outline"
						size="icon"
						className="shrink-0"
						disabled={!activeAccount}
						onClick={() => setShowInactiveConfirm(true)}
						aria-label={ACCOUNTING_UI_TEXT.inactivateSelectedAccountTitle}
						title={ACCOUNTING_UI_TEXT.inactivateSelectedAccountTitle}
					>
						<Icon icon="mdi:eye-off-outline" />
					</Button>
					<div className="min-w-0 pl-1">
						<Text variant="caption" className="block text-slate-400">
							{ACCOUNTING_UI_TEXT.selectedAccountLabel}
						</Text>
						<Text variant="body2" className="truncate text-slate-600">
							{activeAccount?.name ?? ACCOUNTING_UI_TEXT.noAccountSelected}
						</Text>
					</div>
				</div>
				<AccountingCreateMenuButton
					size="sm"
					mainAction={createAccountingCreateMainAction("Create Cash Transaction", navigate)}
					optionLabels={ACCOUNTING_CREATE_OPTION_TARGETS.map((option) => option.label)}
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
					typeOptions: ACCOUNTING_TABLE_TYPE_OPTIONS,
					fieldOptions: ACCOUNTING_TABLE_FIELD_OPTIONS,
					typeValue: listState.typeFilter,
					fieldValue: listState.fieldFilter,
					searchValue: listState.searchValue,
					typePlaceholder: ACCOUNTING_UI_TEXT.tableTypePlaceholder,
					fieldPlaceholder: ACCOUNTING_UI_TEXT.tableFieldPlaceholder,
					searchPlaceholder: ACCOUNTING_UI_TEXT.tableSearchPlaceholder,
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
						<DialogTitle>{ACCOUNTING_UI_TEXT.inactiveConfirmTitle}</DialogTitle>
					</DialogHeader>
					<div className="py-2 text-slate-700">
						Are you sure to make inactive {activeAccount?.name ?? "this account"}?
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowInactiveConfirm(false)}>
							{ACCOUNTING_UI_TEXT.inactiveConfirmCancel}
						</Button>
						<Button variant="info" onClick={handleConfirmInactive}>
							{ACCOUNTING_UI_TEXT.inactiveConfirmAction}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
