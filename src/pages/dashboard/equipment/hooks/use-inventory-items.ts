import { useQuery } from "@tanstack/react-query";
import inventoryService from "@/core/api/services/inventory-service";

export const INVENTORY_QUERY_KEYS = {
	items: ["inventory-items"] as const,
	item: (itemId: string) => ["inventory-item", itemId] as const,
	transactions: (itemId: string) => ["inventory-transactions", itemId] as const,
	borrowings: (itemId: string) => ["inventory-borrowings", itemId] as const,
};

const EMPTY_ITEM_ID = "";

export function useInventoryItems() {
	return useQuery({
		queryKey: INVENTORY_QUERY_KEYS.items,
		queryFn: inventoryService.getItems,
	});
}

export function useInventoryItem(itemId?: string) {
	const normalizedItemId = itemId ?? EMPTY_ITEM_ID;

	return useQuery({
		queryKey: INVENTORY_QUERY_KEYS.item(normalizedItemId),
		queryFn: () => inventoryService.getItem(normalizedItemId),
		enabled: !!itemId,
	});
}

export function useInventoryTransactions(itemId?: string) {
	const normalizedItemId = itemId ?? EMPTY_ITEM_ID;

	return useQuery({
		queryKey: INVENTORY_QUERY_KEYS.transactions(normalizedItemId),
		queryFn: () => inventoryService.getTransactions(normalizedItemId),
		enabled: !!itemId,
	});
}

export function useInventoryBorrowings(itemId?: string) {
	const normalizedItemId = itemId ?? EMPTY_ITEM_ID;

	return useQuery({
		queryKey: INVENTORY_QUERY_KEYS.borrowings(normalizedItemId),
		queryFn: () => inventoryService.getBorrowings(normalizedItemId),
		enabled: !!itemId,
	});
}
