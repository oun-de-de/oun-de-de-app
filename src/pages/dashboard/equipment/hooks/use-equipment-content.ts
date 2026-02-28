import { useCallback, useMemo, useState } from "react";
import { toUtcIsoStartOfDay } from "@/core/utils/date-utils";
import type { ItemRow } from "../components/item-columns";
import { filterItemRows, itemColumns, mapItemsToRows, paginateItemRows } from "../components/item-columns";
import { useInventoryItems } from "./use-inventory-items";
import { useCreateBorrowing, useCreateItem, useUpdateStock } from "./use-inventory-mutations";

export function useEquipmentContent(activeItemId: string | null) {
	const itemId = activeItemId ?? undefined;

	// --- API data ---
	const { data: items = [] } = useInventoryItems();

	// --- Mutations ---
	const updateStockMutation = useUpdateStock(itemId);
	const createBorrowingMutation = useCreateBorrowing(itemId);
	const createItemMutation = useCreateItem();

	// --- Stock In form ---
	const [stockInQty, setStockInQty] = useState("1");
	const [stockInNote, setStockInNote] = useState("");
	const [stockInReason, setStockInReason] = useState("purchase");

	const handleStockIn = useCallback(() => {
		updateStockMutation.mutate(
			{ quantity: Number(stockInQty), reason: stockInReason, memo: stockInNote },
			{
				onSuccess: () => {
					setStockInQty("1");
					setStockInNote("");
					setStockInReason("purchase");
				},
			},
		);
	}, [updateStockMutation, stockInQty, stockInReason, stockInNote]);

	// --- Borrow form ---
	const [borrowQty, setBorrowQty] = useState("1");
	const [borrowCustomerId, setBorrowCustomerId] = useState("");
	const [borrowExpectedReturnDate, setBorrowExpectedReturnDate] = useState("");
	const [borrowMemo, setBorrowMemo] = useState("");

	const handleBorrow = useCallback(() => {
		const expectedReturnDateIso = toUtcIsoStartOfDay(borrowExpectedReturnDate);
		if (!expectedReturnDateIso) return;
		createBorrowingMutation.mutate(
			{
				customerId: borrowCustomerId,
				quantity: Number(borrowQty),
				expectedReturnDate: expectedReturnDateIso,
				memo: borrowMemo,
			},
			{
				onSuccess: () => {
					setBorrowQty("1");
					setBorrowCustomerId("");
					setBorrowExpectedReturnDate("");
					setBorrowMemo("");
				},
			},
		);
	}, [createBorrowingMutation, borrowCustomerId, borrowQty, borrowExpectedReturnDate, borrowMemo]);

	// --- Table state ---
	const [tableTypeFilter, setTableTypeFilter] = useState("all");
	const [tableFieldFilter, setTableFieldFilter] = useState("name");
	const [tableSearchValue, setTableSearchValue] = useState("");
	const [tablePage, setTablePage] = useState(1);
	const [tablePageSize, setTablePageSize] = useState(10);

	// --- Derived data ---
	const activeItem = activeItemId ? (items.find((item) => item.id === activeItemId) ?? null) : null;

	const allRows = useMemo(() => mapItemsToRows(activeItem ? [activeItem] : items), [items, activeItem]);
	const filteredRows = useMemo(
		() => filterItemRows(allRows, tableTypeFilter, tableFieldFilter, tableSearchValue),
		[allRows, tableTypeFilter, tableFieldFilter, tableSearchValue],
	);
	const { pagedRows, totalItems, totalPages, currentPage } = useMemo(
		() => paginateItemRows(filteredRows, tablePage, tablePageSize),
		[filteredRows, tablePage, tablePageSize],
	);
	const columns = useMemo(() => itemColumns(), []);

	// --- Summary cards ---
	const summaryCards = useMemo(() => {
		const displayItems = activeItem ? [activeItem] : items;
		const totalOnHand = displayItems.reduce((sum, item) => sum + item.quantityOnHand, 0);
		const lowStockCount = displayItems.filter((item) => item.quantityOnHand <= item.alertThreshold).length;
		return [
			{ label: "Items", value: displayItems.length, color: "bg-blue-500", icon: "mdi:package-variant" },
			{ label: "Total On Hand", value: totalOnHand, color: "bg-green-500", icon: "mdi:counter" },
			{ label: "Low Stock", value: lowStockCount, color: "bg-orange-500", icon: "mdi:alert-circle-outline" },
		];
	}, [items, activeItem]);

	const handleRowClick = useCallback((row: ItemRow) => {
		return `/dashboard/equipment/${row.id}`;
	}, []);

	return {
		items,
		activeItem,
		summaryCards,

		// Stock In
		stockIn: {
			qty: stockInQty,
			note: stockInNote,
			reason: stockInReason,
			setQty: setStockInQty,
			setNote: setStockInNote,
			setReason: setStockInReason,
			submit: handleStockIn,
			isPending: updateStockMutation.isPending,
		},

		// Borrow
		borrow: {
			qty: borrowQty,
			customerId: borrowCustomerId,
			expectedReturnDate: borrowExpectedReturnDate,
			memo: borrowMemo,
			setQty: setBorrowQty,
			setCustomerId: setBorrowCustomerId,
			setExpectedReturnDate: setBorrowExpectedReturnDate,
			setMemo: setBorrowMemo,
			submit: handleBorrow,
			isPending: createBorrowingMutation.isPending,
		},

		// Create Item
		createItem: {
			mutate: createItemMutation.mutate,
			isPending: createItemMutation.isPending,
		},

		// Transaction table
		table: {
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
		},

		getRowLink: handleRowClick,
	};
}
