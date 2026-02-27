import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import {
	filterRows,
	mapTransactionsToRows,
	paginateRows,
	transactionColumns,
} from "../../components/transaction-columns";
import { useInventoryItem, useInventoryTransactions } from "../../hooks/use-inventory-items";
import { useUpdateStock } from "../../hooks/use-inventory-mutations";

function getQuantityDelta(reason: string, quantity: number) {
	switch (reason.toLowerCase()) {
		case "purchase":
		case "return":
			return quantity;
		case "consume":
		case "borrow":
			return -quantity;
		default:
			return 0;
	}
}

export function useEquipmentDetail() {
	const { id } = useParams<{ id: string }>();
	const itemId = id;

	// --- API data ---
	const { data: activeItem, isLoading: isItemLoading } = useInventoryItem(itemId);
	const { data: transactions = [] } = useInventoryTransactions(itemId);

	// --- Mutations ---
	const updateStockMutation = useUpdateStock(itemId);

	// --- Update Stock form (dialog) ---
	const [updateQty, setUpdateQty] = useState("1");
	const [updateMemo, setUpdateMemo] = useState("");
	const [updateReason, setUpdateReason] = useState("purchase");

	const handleUpdateStock = useCallback((onSuccess?: () => void) => {
		updateStockMutation.mutate(
			{ quantity: Number(updateQty), reason: updateReason, memo: updateMemo },
			{
				onSuccess: () => {
					const parsedQty = Number(updateQty);
					if (activeItem && Number.isFinite(parsedQty)) {
						const updatedQty = activeItem.quantityOnHand + getQuantityDelta(updateReason, parsedQty);
						if (updatedQty < activeItem.alertThreshold) {
							toast.warning(
								`Stock is below threshold (${updatedQty} < ${activeItem.alertThreshold}) for ${activeItem.name}.`,
							);
						}
					}
					setUpdateQty("1");
					setUpdateMemo("");
					setUpdateReason("purchase");
					onSuccess?.();
				},
			},
		);
	}, [updateStockMutation, updateQty, updateReason, updateMemo, activeItem]);

	// --- Table state ---
	const [tableTypeFilter, setTableTypeFilter] = useState("all");
	const [tableFieldFilter, setTableFieldFilter] = useState("reason");
	const [tableSearchValue, setTableSearchValue] = useState("");
	const [tablePage, setTablePage] = useState(1);
	const [tablePageSize, setTablePageSize] = useState(10);

	// --- Derived data ---
	const allRows = useMemo(() => mapTransactionsToRows(transactions), [transactions]);
	const filteredRows = useMemo(
		() => filterRows(allRows, tableTypeFilter, tableFieldFilter, tableSearchValue),
		[allRows, tableTypeFilter, tableFieldFilter, tableSearchValue],
	);
	const { pagedRows, totalItems, totalPages, currentPage } = useMemo(
		() => paginateRows(filteredRows, tablePage, tablePageSize),
		[filteredRows, tablePage, tablePageSize],
	);
	const columns = useMemo(() => transactionColumns(), []);

	return {
		activeItem: activeItem ?? null,
		isItemLoading,

		// Update Stock
		stockUpdate: {
			qty: updateQty,
			memo: updateMemo,
			reason: updateReason,
			setQty: setUpdateQty,
			setMemo: setUpdateMemo,
			setReason: setUpdateReason,
			submit: handleUpdateStock,
			isPending: updateStockMutation.isPending,
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
	};
}
