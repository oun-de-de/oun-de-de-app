import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import { SplitButton } from "@/core/components/common/split-button";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import type { BorrowState } from "@/pages/dashboard/borrow/stores/borrow-store";
import { MOCK_LOAN_RECORDS } from "../constants/loan-records";
import {
	BORROW_FIELD_OPTIONS,
	BORROW_TYPE_OPTIONS,
	buildBorrowSummaryCards,
	filterBorrowRows,
	paginateBorrowRows,
} from "../utils/borrow-content-utils";
import { mapLoanRecordToBorrowRow } from "../utils/loan-utils";
import { borrowColumns } from "./borrow-columns";

type Props = {
	activeBorrowId: string | null;
	listState: BorrowState;
	updateState: (updates: Partial<Omit<BorrowState, "type">>) => void;
};

export function BorrowContent({ activeBorrowId, listState, updateState }: Props) {
	const navigate = useNavigate();
	const { fieldFilter, searchValue, typeFilter } = listState;
	const loanRows = useMemo(() => MOCK_LOAN_RECORDS.map((record) => mapLoanRecordToBorrowRow(record)), []);

	const filteredData = useMemo(
		() => filterBorrowRows(loanRows, { fieldFilter, searchValue, typeFilter }),
		[fieldFilter, loanRows, searchValue, typeFilter],
	);
	const summaryCards = useMemo(() => buildBorrowSummaryCards(loanRows), [loanRows]);
	const { totalItems, totalPages, paginatedRows, paginationItems } = useMemo(
		() => paginateBorrowRows(filteredData, listState.page, listState.pageSize),
		[filteredData, listState.page, listState.pageSize],
	);

	useEffect(() => {
		if (listState.page > totalPages) {
			updateState({ page: totalPages });
		}
	}, [listState.page, totalPages, updateState]);

	const activeBorrow = loanRows.find((row) => row.id === activeBorrowId);

	const mainAction = {
		label: listState.activeView === "requests" ? "Requests" : "All Loans",
		onClick: () => {},
	};

	const options = [
		{ label: "All Loans", onClick: () => updateState({ activeView: "all" }) },
		{ label: "Requests", onClick: () => updateState({ activeView: "requests" }) },
	];

	const newBorrowMainAction = {
		label: (
			<span className="flex items-center gap-2">
				<Icon icon="mdi:plus" />
				New Loan
			</span>
		),
		onClick: () => navigate("/dashboard/borrow/new"),
	};

	const newBorrowOptions = [
		{ label: "Record Monthly Payment", onClick: () => {} },
		{ label: "Adjust Schedule", onClick: () => {} },
	];

	const filterConfig = {
		typeOptions: BORROW_TYPE_OPTIONS,
		fieldOptions: BORROW_FIELD_OPTIONS,
		typeValue: listState.typeFilter,
		fieldValue: listState.fieldFilter || "refNo",
		searchValue: listState.searchValue,
		onTypeChange: (v: string) => updateState({ typeFilter: v, page: 1 }),
		onFieldChange: (v: string) => updateState({ fieldFilter: v, page: 1 }),
		onSearchChange: (v: string) => updateState({ searchValue: v, page: 1 }),
	};

	const paginationConfig = {
		page: listState.page,
		pageSize: listState.pageSize,
		totalItems,
		totalPages,
		onPageChange: (p: number) => updateState({ page: p }),
		onPageSizeChange: (s: number) => updateState({ pageSize: s, page: 1 }),
		paginationItems,
	};

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2 mb-4">
				<div className="flex items-center gap-2">
					<SplitButton variant="outline" size="sm" mainAction={mainAction} options={options} />
					<Text variant="body2" className="text-slate-400">
						{activeBorrow ? `${activeBorrow.refNo} selected` : "No Record Selected"}
					</Text>
				</div>

				<div className="flex gap-2">
					<Button size="sm" className="gap-2" variant="outline">
						<Icon icon="mdi:printer" />
						Print Report
					</Button>
					<SplitButton mainAction={newBorrowMainAction} options={newBorrowOptions} />
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
			/>
		</>
	);
}
