import { useMemo } from "react";
import { useNavigate } from "react-router";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import { SplitButton } from "@/core/components/common/split-button";
import Icon from "@/core/components/icon/icon";
import type { SummaryStatCardData } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";

import type { BorrowListState } from "@/pages/dashboard/borrow/stores/borrowStore";
import { type BorrowRow, borrowColumns } from "./borrow-columns";

// Mock Stats
const SUMMARY_CARDS: SummaryStatCardData[] = [
	{ label: "Active Borrows", value: 12, color: "bg-blue-500", icon: "mdi:clipboard-clock-outline" },
	{ label: "Overdue", value: 2, color: "bg-red-500", icon: "mdi:alert-circle-outline" },
	{ label: "Returned Today", value: 5, color: "bg-emerald-500", icon: "mdi:check-circle-outline" },
];

const MOCK_BORROWS: BorrowRow[] = [
	{ id: "1", refNo: "BR-2025-001", borrower: "John Doe", date: "2025-01-20", status: "Active", itemCount: 2 },
	{ id: "2", refNo: "BR-2025-002", borrower: "Jane Smith", date: "2025-01-18", status: "Active", itemCount: 1 },
	{ id: "3", refNo: "BR-2025-003", borrower: "Alice Johnson", date: "2025-01-15", status: "Returned", itemCount: 3 },
	{ id: "4", refNo: "BR-2025-004", borrower: "Bob Brown", date: "2025-01-10", status: "Overdue", itemCount: 1 },
];

type Props = {
	activeBorrowId: string | null;
	listState: BorrowListState;
	updateState: (updates: Partial<BorrowListState>) => void;
};

export function BorrowContent({ activeBorrowId, listState, updateState }: Props) {
	const navigate = useNavigate();

	const filteredData = useMemo(() => {
		let data = MOCK_BORROWS;
		if (listState.searchValue) {
			const q = listState.searchValue.toLowerCase();
			data = data.filter((row) => row.refNo.toLowerCase().includes(q) || row.borrower.toLowerCase().includes(q));
		}
		if (listState.typeFilter !== "all") {
			data = data.filter((row) => row.status === listState.typeFilter);
		}
		return data;
	}, [listState.searchValue, listState.typeFilter]);

	const totalItems = filteredData.length;
	const totalPages = Math.ceil(totalItems / listState.pageSize);
	const paginatedData = filteredData.slice(
		(listState.page - 1) * listState.pageSize,
		listState.page * listState.pageSize,
	);

	const activeBorrow = MOCK_BORROWS.find((b) => b.id === activeBorrowId);

	const mainAction = {
		label: listState.activeView === "requests" ? "Requests" : "All Borrowings",
		onClick: () => {},
	};

	const options = [
		{ label: "All Borrowings", onClick: () => updateState({ activeView: "all" }) },
		{ label: "Requests", onClick: () => updateState({ activeView: "requests" }) },
	];

	const newBorrowMainAction = {
		label: (
			<span className="flex items-center gap-2">
				<Icon icon="mdi:plus" />
				New Borrowing
			</span>
		),
		onClick: () => navigate("/dashboard/borrow/new"),
	};

	const newBorrowOptions = [
		{ label: "Return Equipment", onClick: () => {} },
		{ label: "Report Issue", onClick: () => {} },
	];

	const filterConfig = {
		typeOptions: [
			{ label: "All Status", value: "all" },
			{ label: "Active", value: "Active" },
			{ label: "Returned", value: "Returned" },
			{ label: "Overdue", value: "Overdue" },
		],
		fieldOptions: [
			{ label: "Ref No", value: "refNo" },
			{ label: "Borrower", value: "borrower" },
		],
		typeValue: listState.typeFilter,
		fieldValue: listState.fieldFilter || "refNo",
		searchValue: listState.searchValue,
		onTypeChange: (v: string) => updateState({ typeFilter: v, page: 1 }),
		onFieldChange: (v: string) => updateState({ fieldFilter: v }),
		onSearchChange: (v: string) => updateState({ searchValue: v, page: 1 }),
	};

	const paginationConfig = {
		page: listState.page,
		pageSize: listState.pageSize,
		totalItems,
		totalPages,
		onPageChange: (p: number) => updateState({ page: p }),
		onPageSizeChange: (s: number) => updateState({ pageSize: s, page: 1 }),
		paginationItems: Array.from({ length: totalPages }, (_, i) => i + 1),
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
				{SUMMARY_CARDS.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				data={paginatedData}
				columns={borrowColumns}
				filterConfig={filterConfig}
				paginationConfig={paginationConfig}
			/>
		</>
	);
}
