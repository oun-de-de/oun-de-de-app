import { useInventoryItem, useInventoryTransactions } from "../../hooks/use-inventory-items";

export function useEquipmentQueries(itemId: string | undefined) {
	const { data: activeItem, isLoading: isItemLoading } = useInventoryItem(itemId);
	const { data: transactions = [], isLoading: isTransactionsLoading } = useInventoryTransactions(itemId);

	return {
		activeItem: activeItem ?? null,
		isItemLoading,
		transactions,
		isTransactionsLoading,
	};
}
