import type {
	CreateBorrowingRequest,
	CreateInventoryItem,
	InventoryBorrowing,
	InventoryItem,
	InventoryTransaction,
	UpdateStockRequest,
} from "@/core/types/inventory";
import { apiClient } from "../apiClient";

export enum InventoryApi {
	Items = "/inventory/items",
}

const getItems = (): Promise<InventoryItem[]> =>
	apiClient.get<InventoryItem[]>({
		url: InventoryApi.Items,
	});

const createItem = (data: CreateInventoryItem): Promise<InventoryItem> =>
	apiClient.post<InventoryItem>({
		url: InventoryApi.Items,
		data,
	});

const getItem = (itemId: string): Promise<InventoryItem> =>
	apiClient.get<InventoryItem>({
		url: `${InventoryApi.Items}/${itemId}`,
	});

const updateStock = (itemId: string, data: UpdateStockRequest): Promise<InventoryTransaction> =>
	apiClient.post<InventoryTransaction>({
		url: `${InventoryApi.Items}/${itemId}/update-stock`,
		data,
	});

const getBorrowings = (itemId: string): Promise<InventoryBorrowing[]> =>
	apiClient.get<InventoryBorrowing[]>({
		url: `${InventoryApi.Items}/${itemId}/borrowings`,
	});

const createBorrowing = (itemId: string, data: CreateBorrowingRequest): Promise<InventoryTransaction> =>
	apiClient.post<InventoryTransaction>({
		url: `${InventoryApi.Items}/${itemId}/borrowings`,
		data,
	});

const returnBorrowing = (itemId: string, borrowingId: string): Promise<InventoryTransaction> =>
	apiClient.post<InventoryTransaction>({
		url: `${InventoryApi.Items}/${itemId}/borrowings/${borrowingId}/return`,
	});

const getTransactions = (itemId: string): Promise<InventoryTransaction[]> =>
	apiClient.get<InventoryTransaction[]>({
		url: `${InventoryApi.Items}/${itemId}/transactions`,
	});

export default {
	getItems,
	createItem,
	getItem,
	updateStock,
	getBorrowings,
	createBorrowing,
	returnBorrowing,
	getTransactions,
};
