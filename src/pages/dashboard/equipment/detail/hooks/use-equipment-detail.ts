import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { transactionColumns } from "../../components/transaction-columns";
import { useInventoryItem, useInventoryTransactions } from "../../hooks/use-inventory-items";
import { useUpdateStock } from "../../hooks/use-inventory-mutations";
import { filterRows, mapTransactionsToRows, paginateRows } from "../../utils/transaction-columns-utils";

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

const DEFAULT_UPDATE_QTY = "1";
const DEFAULT_UPDATE_REASON = "purchase";
const DEFAULT_TABLE_FILTERS = {
	type: "all",
	field: "reason",
	search: "",
	page: 1,
	pageSize: 10,
} as const;

function buildPreviewUrl(itemId: string, txId: string) {
	return `/dashboard/equipment/print-preview?itemId=${encodeURIComponent(itemId)}&txId=${encodeURIComponent(txId)}`;
}

type TransactionPrintRow = ReturnType<typeof mapTransactionsToRows>[number];

export function useEquipmentDetail() {
	const { id } = useParams<{ id: string }>();
	const itemId = id;

	// --- API data ---
	const { data: activeItem, isLoading: isItemLoading } = useInventoryItem(itemId);
	const { data: transactions = [] } = useInventoryTransactions(itemId);

	// --- Mutations ---
	const updateStockMutation = useUpdateStock(itemId);

	// --- Update Stock form (dialog) ---
	const [updateQty, setUpdateQty] = useState(DEFAULT_UPDATE_QTY);
	const [updateMemo, setUpdateMemo] = useState("");
	const [updateReason, setUpdateReason] = useState(DEFAULT_UPDATE_REASON);
	const [updateExpense, setUpdateExpense] = useState("");
	const resetUpdateStockForm = useCallback(() => {
		setUpdateQty(DEFAULT_UPDATE_QTY);
		setUpdateMemo("");
		setUpdateReason(DEFAULT_UPDATE_REASON);
		setUpdateExpense("");
	}, []);

	const handleUpdateStock = useCallback(
		(onSuccess?: () => void) => {
			const parsedExpense = Number(updateExpense);
			const parsedQty = Number(updateQty);

			const updatePayload = {
				quantity: parsedQty,
				reason: updateReason,
				memo: updateMemo,
				...(Number.isFinite(parsedExpense) && parsedExpense > 0 ? { expense: parsedExpense } : {}),
			};
			updateStockMutation.mutate(updatePayload, {
				onSuccess: () => {
					if (activeItem && Number.isFinite(parsedQty)) {
						const updatedQty = activeItem.quantityOnHand + getQuantityDelta(updateReason, parsedQty);
						if (updatedQty < activeItem.alertThreshold) {
							toast.warning(
								`Stock is below threshold (${updatedQty} < ${activeItem.alertThreshold}) for ${activeItem.name}.`,
							);
						}
					}
					resetUpdateStockForm();
					onSuccess?.();
				},
			});
		},
		[updateStockMutation, updateQty, updateReason, updateMemo, updateExpense, activeItem, resetUpdateStockForm],
	);

	// --- Table state ---
	const [tableTypeFilter, setTableTypeFilter] = useState<string>(DEFAULT_TABLE_FILTERS.type);
	const [tableFieldFilter, setTableFieldFilter] = useState<string>(DEFAULT_TABLE_FILTERS.field);
	const [tableSearchValue, setTableSearchValue] = useState<string>(DEFAULT_TABLE_FILTERS.search);
	const [tablePage, setTablePage] = useState<number>(DEFAULT_TABLE_FILTERS.page);
	const [tablePageSize, setTablePageSize] = useState<number>(DEFAULT_TABLE_FILTERS.pageSize);

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

	const navigate = useNavigate();

	const handlePrintTransactionReport = useCallback(
		(row: TransactionPrintRow) => {
			if (!itemId) {
				toast.error("Unable to open print preview");
				return;
			}

			const previewUrl = buildPreviewUrl(itemId, row.id);
			navigate(previewUrl);
		},
		[itemId, navigate],
	);

	const columns = useMemo(
		() => transactionColumns({ onPrintReport: handlePrintTransactionReport }),
		[handlePrintTransactionReport],
	);

	return {
		activeItem: activeItem ?? null,
		isItemLoading,

		// Update Stock
		stockUpdate: {
			qty: updateQty,
			memo: updateMemo,
			reason: updateReason,
			expense: updateExpense,
			setQty: setUpdateQty,
			setMemo: setUpdateMemo,
			setReason: setUpdateReason,
			setExpense: setUpdateExpense,
			reset: resetUpdateStockForm,
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
