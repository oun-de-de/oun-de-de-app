import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import inventoryService from "@/core/api/services/inventory-service";
import type { CreateBorrowingRequest, CreateInventoryItem, UpdateStockRequest } from "@/core/types/inventory";
import { INVENTORY_QUERY_KEYS } from "./use-inventory-items";

function assertItemId(itemId?: string): string {
	if (!itemId) throw new Error("Item ID is required");
	return itemId;
}

async function invalidateItemRelatedQueries(queryClient: ReturnType<typeof useQueryClient>, itemId?: string) {
	const tasks = [queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.items })];

	if (itemId) {
		tasks.push(
			queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.item(itemId) }),
			queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.transactions(itemId) }),
			queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.borrowings(itemId) }),
		);
	}

	await Promise.all(tasks);
}

function useInventoryMutation<TVariables>({
	itemId,
	mutationFn,
	successMessage,
	errorMessage,
}: {
	itemId?: string;
	mutationFn: (variables: TVariables) => Promise<unknown>;
	successMessage: string;
	errorMessage: string;
}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess: async () => {
			toast.success(successMessage);
			await invalidateItemRelatedQueries(queryClient, itemId);
		},
		onError: () => {
			toast.error(errorMessage);
		},
	});
}

export function useCreateItem() {
	return useInventoryMutation<CreateInventoryItem>({
		mutationFn: (data: CreateInventoryItem) => inventoryService.createItem(data),
		successMessage: "Item created successfully",
		errorMessage: "Failed to create item",
	});
}

export function useUpdateStock(itemId?: string) {
	return useInventoryMutation<UpdateStockRequest>({
		itemId,
		mutationFn: (data: UpdateStockRequest) => {
			const requiredItemId = assertItemId(itemId);
			return inventoryService.updateStock(requiredItemId, data);
		},
		successMessage: "Stock updated successfully",
		errorMessage: "Failed to update stock",
	});
}

export function useCreateBorrowing(itemId?: string) {
	return useInventoryMutation<CreateBorrowingRequest>({
		itemId,
		mutationFn: (data: CreateBorrowingRequest) => {
			const requiredItemId = assertItemId(itemId);
			return inventoryService.createBorrowing(requiredItemId, data);
		},
		successMessage: "Borrowing created successfully",
		errorMessage: "Failed to create borrowing",
	});
}

export function useReturnBorrowing(itemId?: string) {
	return useInventoryMutation<string>({
		itemId,
		mutationFn: (borrowingId: string) => {
			const requiredItemId = assertItemId(itemId);
			return inventoryService.returnBorrowing(requiredItemId, borrowingId);
		},
		successMessage: "Borrowing returned successfully",
		errorMessage: "Failed to return borrowing",
	});
}
