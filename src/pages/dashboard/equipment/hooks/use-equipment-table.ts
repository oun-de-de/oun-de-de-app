import { useCallback, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router";
import type { InventoryItem } from "@/core/types/inventory";
import type { ItemRow } from "../components/item-columns";
import { filterItemRows, itemColumns, mapItemsToRows, paginateItemRows } from "../components/item-columns";

export function useEquipmentTable(items: InventoryItem[], navigate: NavigateFunction) {
	const [tableTypeFilter, setTableTypeFilter] = useState("all");
	const [tableFieldFilter, setTableFieldFilter] = useState("name");
	const [tableSearchValue, setTableSearchValue] = useState("");
	const [tablePage, setTablePage] = useState(1);
	const [tablePageSize, setTablePageSize] = useState(20);

	const allRows = useMemo(() => mapItemsToRows(items), [items]);
	const filteredRows = useMemo(
		() => filterItemRows(allRows, tableTypeFilter, tableFieldFilter, tableSearchValue),
		[allRows, tableTypeFilter, tableFieldFilter, tableSearchValue],
	);
	const { pagedRows, totalItems, totalPages, currentPage } = useMemo(
		() => paginateItemRows(filteredRows, tablePage, tablePageSize),
		[filteredRows, tablePage, tablePageSize],
	);
	const columns = useMemo(
		() =>
			itemColumns({
				onUpdateStock: (itemId) => navigate(`/dashboard/equipment/${itemId}?action=stock`),
				onBorrowings: (itemId) => navigate(`/dashboard/equipment/${itemId}?action=borrowings`),
			}),
		[navigate],
	);
	const getRowLink = useCallback((row: ItemRow) => `/dashboard/equipment/${row.id}`, []);

	return {
		columns,
		pagedRows,
		currentPage,
		totalItems,
		totalPages,
		typeFilter: tableTypeFilter,
		fieldFilter: tableFieldFilter,
		searchValue: tableSearchValue,
		pageSize: tablePageSize,
		setTypeFilter: setTableTypeFilter,
		setFieldFilter: setTableFieldFilter,
		setSearchValue: setTableSearchValue,
		setPage: setTablePage,
		setPageSize: setTablePageSize,
		getRowLink,
	};
}
