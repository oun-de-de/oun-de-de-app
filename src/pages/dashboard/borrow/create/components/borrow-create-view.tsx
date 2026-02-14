import type { ColumnDef } from "@tanstack/react-table";
import { List } from "lucide-react";
import { useMemo, useState } from "react";
import { SmartDataTable } from "@/core/components/common/smart-data-table";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { SectionHeader } from "@/pages/dashboard/borrow/components/borrow-section-header";
import { useBorrowCartActions } from "@/pages/dashboard/borrow/stores/borrow-cart-store";
import { BorrowCreateCartPanel } from "./borrow-create-cart-panel";
import { type Equipment, getBorrowCreateColumns } from "./borrow-create-columns";
import { BorrowCreateFilter } from "./borrow-create-filter";
import { BorrowCreateHeader } from "./borrow-create-header";
import { BorrowCreateLayout } from "./borrow-create-layout";

const MOCK_EQUIPMENT: Equipment[] = [
	{ id: "e1", code: "EQ-001", name: "Drill Machine X200", category: "Power Tools", inStock: 5, price: 50 },
	{ id: "e2", code: "EQ-002", name: "Hammer Heavy Duty", category: "Hand Tools", inStock: 12, price: 10 },
	{ id: "e3", code: "EQ-003", name: "Ladder 10ft", category: "General", inStock: 3, price: 25 },
	{ id: "e4", code: "EQ-004", name: "Safety Helmet", category: "Safety", inStock: 20, price: 5 },
	{ id: "e5", code: "EQ-005", name: "Cordless Screwdriver", category: "Power Tools", inStock: 8, price: 35 },
];

export function BorrowCreateView() {
	const [searchText, setSearchText] = useState("");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const { addToCart } = useBorrowCartActions();

	const columns = useMemo<ColumnDef<Equipment>[]>(() => getBorrowCreateColumns(addToCart), [addToCart]);

	const filteredData = useMemo(() => {
		if (!searchText) return MOCK_EQUIPMENT;
		const q = searchText.toLowerCase();
		return MOCK_EQUIPMENT.filter((e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q));
	}, [searchText]);
	const totalItems = filteredData.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const currentPage = Math.min(page, totalPages);
	const pagedData = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredData.slice(start, start + pageSize);
	}, [currentPage, filteredData, pageSize]);

	return (
		<BorrowCreateLayout header={<BorrowCreateHeader />} rightPanel={<BorrowCreateCartPanel />}>
			<BorrowCreateFilter searchText={searchText} setSearchText={setSearchText} />

			<div className="px-6 py-2">
				<div className="border-t border-gray-100"></div>
			</div>

			<div className="flex-1 flex flex-col min-h-0 px-6 pb-4">
				<SectionHeader title="Available Equipment" icon={List} />
				<div className="flex-1 bg-white flex flex-col overflow-hidden">
					<SmartDataTable
						data={pagedData}
						columns={columns}
						className="border-none shadow-none text-sm flex-1 min-h-0"
						maxBodyHeight="100%"
						paginationConfig={{
							page: currentPage,
							pageSize,
							totalItems,
							totalPages,
							onPageChange: setPage,
							onPageSizeChange: (size) => {
								setPageSize(size);
								setPage(1);
							},
							paginationItems: buildPagination(currentPage, totalPages),
						}}
					/>
				</div>
			</div>
		</BorrowCreateLayout>
	);
}
