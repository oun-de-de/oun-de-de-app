import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import type { BorrowState } from "@/pages/dashboard/borrow/stores/borrow-store";
import { useLoans } from "../hooks/use-loans";
import {
	buildLoanSummaryCards,
	buildBorrowTableConfigs,
	buildLoanViewActions,
	filterLoans,
	paginateLoans,
} from "../utils/borrow-content-utils";
import { borrowColumns } from "./borrow-columns";

type Props = {
	activeCustomerId: string | null;
	activeCustomerName: string | null;
	listState: BorrowState;
	updateState: (updates: Partial<Omit<BorrowState, "type">>) => void;
};

export function BorrowContent({ activeCustomerId, activeCustomerName, listState, updateState }: Props) {
	const navigate = useNavigate();
	const { searchValue, typeFilter } = listState;
	const { data: loansResponse } = useLoans();

	const loans = useMemo(
		() =>
			(loansResponse?.content ?? []).filter(
				(loan) => !activeCustomerId || (loan.borrowerType === "customer" && loan.borrowerId === activeCustomerId),
			),
		[loansResponse, activeCustomerId],
	);

	const filteredLoans = useMemo(
		() => filterLoans(loans, { searchValue, typeFilter }),
		[loans, searchValue, typeFilter],
	);
	const summaryCards = useMemo(() => buildLoanSummaryCards(loans), [loans]);
	const { totalItems, totalPages, paginatedLoans, paginationItems } = useMemo(
		() => paginateLoans(filteredLoans, listState.page, listState.pageSize),
		[filteredLoans, listState.page, listState.pageSize],
	);
	const { newBorrowMainAction } = useMemo(
		() => buildLoanViewActions({ activeView: listState.activeView, updateState, navigate }),
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
					<Text variant="body2" className="text-slate-400">
						{activeCustomerId ? `${activeCustomerName || activeCustomerId} selected` : "All Customers"}
					</Text>
				</div>

				<div className="flex gap-2">
					<Button
						size="sm"
						onClick={newBorrowMainAction.onClick}
						className="bg-emerald-400 text-white hover:bg-emerald-500"
					>
						{newBorrowMainAction.label}
					</Button>
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
				data={paginatedLoans}
				columns={borrowColumns}
				filterConfig={{ ...filterConfig, showFieldFilter: false }}
				paginationConfig={paginationConfig}
				onRowClick={(row) => navigate(`/dashboard/loan/${row.id}`)}
			/>
		</>
	);
}
