import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import { SplitButton } from "@/core/components/common/split-button";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import type { BorrowState } from "@/pages/dashboard/borrow/stores/borrow-store";
import { useLoans } from "../hooks/use-loans";
import {
	buildBorrowSummaryCards,
	buildBorrowTableConfigs,
	buildBorrowViewActions,
	filterBorrowRows,
	paginateBorrowRows,
} from "../utils/borrow-content-utils";
import { mapLoanToBorrowRow } from "../utils/loan-utils";
import { borrowColumns } from "./borrow-columns";

type Props = {
	activeCustomerId: string | null;
	activeCustomerName: string | null;
	listState: BorrowState;
	updateState: (updates: Partial<Omit<BorrowState, "type">>) => void;
};

export function BorrowContent({ activeCustomerId, activeCustomerName, listState, updateState }: Props) {
	const navigate = useNavigate();
	const { fieldFilter, searchValue, typeFilter } = listState;
	const { data: loansResponse } = useLoans();

	const loanRows = useMemo(
		() =>
			(loansResponse?.content ?? [])
				.filter((loan) => !activeCustomerId || loan.borrowerId === activeCustomerId)
				.map((loan) => mapLoanToBorrowRow(loan)),
		[loansResponse, activeCustomerId],
	);

	const filteredData = useMemo(
		() => filterBorrowRows(loanRows, { fieldFilter, searchValue, typeFilter }),
		[fieldFilter, loanRows, searchValue, typeFilter],
	);
	const summaryCards = useMemo(() => buildBorrowSummaryCards(loanRows), [loanRows]);
	const { totalItems, totalPages, paginatedRows, paginationItems } = useMemo(
		() => paginateBorrowRows(filteredData, listState.page, listState.pageSize),
		[filteredData, listState.page, listState.pageSize],
	);
	const { mainAction, options, newBorrowMainAction, newBorrowOptions } = useMemo(
		() => buildBorrowViewActions({ activeView: listState.activeView, updateState, navigate }),
		[listState.activeView, navigate, updateState],
	);
	const { filterConfig, paginationConfig } = useMemo(
		() =>
			buildBorrowTableConfigs({
				state: listState,
				totalItems,
				totalPages,
				paginationItems,
				updateState,
			}),
		[listState, paginationItems, totalItems, totalPages, updateState],
	);

	useEffect(() => {
		if (listState.page > totalPages) {
			updateState({ page: totalPages });
		}
	}, [listState.page, totalPages, updateState]);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2 mb-4">
				<div className="flex items-center gap-2">
					<SplitButton
						variant="outline"
						size="sm"
						mainAction={mainAction}
						options={options}
						mainButtonClassName="bg-blue-400 text-white hover:bg-blue-500 border-blue-400"
						triggerButtonClassName="bg-blue-400 text-white hover:bg-blue-500 border-blue-400"
					/>
					<Text variant="body2" className="text-slate-400">
						{activeCustomerId ? `${activeCustomerName || activeCustomerId} selected` : "All Customers"}
					</Text>
				</div>

				<div className="flex gap-2">
					<Button size="sm" className="gap-2 bg-blue-400 text-white shadow-sm hover:bg-blue-500">
						<Icon icon="mdi:printer" />
						Print Report
					</Button>
					<SplitButton
						mainAction={newBorrowMainAction}
						options={newBorrowOptions}
						mainButtonClassName="bg-emerald-400 text-white hover:bg-emerald-500"
						triggerButtonClassName="bg-emerald-400 text-white hover:bg-emerald-500"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 mb-4">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={paginatedRows}
				columns={borrowColumns}
				filterConfig={filterConfig}
				paginationConfig={paginationConfig}
				onRowClick={(row) => navigate(`/dashboard/borrow/${row.id}`)}
			/>
		</>
	);
}
