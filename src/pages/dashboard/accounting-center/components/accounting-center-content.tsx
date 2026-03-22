import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import type { CashTransaction, CashTransactionSummary } from "@/core/types/cash-transaction";
import { formatKHR, formatNumber } from "@/core/utils/formatters";
import { Text } from "@/core/ui/typography";
import type { ListState } from "@/core/store/createListStore";
import { useNavigate } from "react-router";
import { createAccountingCreateMainAction } from "@/pages/dashboard/accounting/constants";
import { AccountingCreateMenuButton } from "@/pages/dashboard/accounting/components/accounting-create-menu-button";
import { accountingCenterColumns } from "./accounting-center-columns";

type AccountingCenterContentProps = {
	accountLabel: string;
	activeCounterpartyName: string | null;
	listState: ListState;
	updateState: (state: Partial<ListState>) => void;
	pagedTransactions: CashTransaction[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
	typeOptions: Array<{ value: string; label: string }>;
	summary: CashTransactionSummary;
};

const FIELD_OPTIONS = [
	{ value: "all", label: "All Fields" },
	{ value: "name", label: "Name" },
	{ value: "ref-no", label: "Ref No" },
	{ value: "memo", label: "Memo" },
];

export function AccountingCenterContent({
	accountLabel,
	activeCounterpartyName,
	listState,
	updateState,
	pagedTransactions,
	totalItems,
	totalPages,
	currentPage,
	paginationItems,
	typeOptions,
	summary,
}: AccountingCenterContentProps) {
	const navigate = useNavigate();
	const summaryCards = [
		{
			label: "Transactions",
			value: formatNumber(summary.count),
			color: "bg-sky-500",
			icon: "mdi:format-list-bulleted",
		},
		{ label: "Total Debit", value: formatKHR(summary.debit), color: "bg-emerald-500", icon: "mdi:arrow-down-bold" },
		{ label: "Total Credit", value: formatKHR(summary.credit), color: "bg-rose-500", icon: "mdi:arrow-up-bold" },
		{ label: "Ending Balance", value: formatKHR(summary.balance), color: "bg-amber-500", icon: "mdi:cash-register" },
	];

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
				<div className="flex flex-col gap-1">
					<Text variant="body2" className="text-slate-400">
						{activeCounterpartyName ? `${activeCounterpartyName} selected` : "All counterparties"}
					</Text>
					<Text variant="caption" className="text-slate-500">
						{accountLabel}
					</Text>
				</div>
				<AccountingCreateMenuButton
					size="sm"
					mainAction={createAccountingCreateMainAction("Create Expense", navigate)}
					optionLabels={["Create Revenue"]}
				/>
			</div>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={pagedTransactions}
				columns={accountingCenterColumns}
				filterConfig={{
					typeOptions,
					fieldOptions: FIELD_OPTIONS,
					typeValue: listState.typeFilter,
					fieldValue: listState.fieldFilter,
					searchValue: listState.searchValue,
					typePlaceholder: "Transaction Type",
					fieldPlaceholder: "Search Field",
					searchPlaceholder: "Search accounting entries...",
					onTypeChange: (value: string) => updateState({ typeFilter: value, page: 1 }),
					onFieldChange: (value: string) => updateState({ fieldFilter: value, page: 1 }),
					onSearchChange: (value: string) => updateState({ searchValue: value, page: 1 }),
				}}
				paginationConfig={{
					page: currentPage,
					pageSize: listState.pageSize,
					totalItems,
					totalPages,
					paginationItems,
					onPageChange: (nextPage: number) => updateState({ page: nextPage }),
					onPageSizeChange: (nextSize: number) => updateState({ pageSize: nextSize, page: 1 }),
				}}
			/>
		</>
	);
}
