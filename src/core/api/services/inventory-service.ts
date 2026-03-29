import type {
	CreateBorrowingRequest,
	CreateInventoryItem,
	InventoryBorrowing,
	InventoryItem,
	InventoryTransaction,
	SellEquipmentRequest,
	UpdateStockRequest,
} from "@/core/types/inventory";
import { apiClient } from "../apiClient";

export enum InventoryApi {
	Items = "/inventory/items",
}

const getItems = ({ params }: { params?: { sort?: string } }): Promise<InventoryItem[]> =>
	apiClient.get<InventoryItem[]>({
		url: InventoryApi.Items,
		params: {
			sort: params?.sort,
		},
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

const sellBorrowing = (
	itemId: string,
	borrowingId: string,
	data: SellEquipmentRequest,
): Promise<InventoryTransaction> =>
	apiClient.post<InventoryTransaction>({
		url: `${InventoryApi.Items}/${itemId}/borrowings/${borrowingId}/sell`,
		data,
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
	sellBorrowing,
	getTransactions,
};
