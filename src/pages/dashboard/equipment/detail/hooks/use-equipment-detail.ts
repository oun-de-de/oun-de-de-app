import { useParams } from "react-router";
import { useGetSupplierList, useGetUnitList } from "@/pages/dashboard/settings/hooks/use-settings";
import type { UpdateInventoryItem } from "@/core/types/inventory";
import { useUpdateItem } from "../../hooks/use-inventory-mutations";
import { useEquipmentQueries } from "./use-equipment-queries";
import { useEquipmentStockForm } from "./use-equipment-stock-form";
import { useEquipmentTransactionsTable } from "./use-equipment-transactions-table";

export function useEquipmentDetail() {
	const { id: itemId } = useParams<{ id: string }>();

	// --- Queries ---
	const { activeItem, isItemLoading, transactions } = useEquipmentQueries(itemId);
	const { data: units = [] } = useGetUnitList();
	const { data: suppliers = [] } = useGetSupplierList();
	const updateItemMutation = useUpdateItem(itemId);

	// --- Stock Update Form ---
	const {
		form: stockUpdateForm,
		isPending: isStockUpdatePending,
		regenerateRefCode,
		submit: submitStockUpdate,
	} = useEquipmentStockForm(activeItem);

	// --- Transactions Table ---
	const table = useEquipmentTransactionsTable(itemId, transactions);

	return {
		activeItem,
		isItemLoading,
		units,
		suppliers,
		updateItem: {
			submit: (values: UpdateInventoryItem) => updateItemMutation.mutateAsync(values),
			isPending: updateItemMutation.isPending,
		},

		// Update Stock
		stockUpdate: {
			form: stockUpdateForm,
			isPending: isStockUpdatePending,
			regenerateRefCode,
			submit: submitStockUpdate,
			reset: () => stockUpdateForm.reset(),
		},

		// Transaction table
		table,
	};
}
