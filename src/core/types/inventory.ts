export type InventoryItemType = "CONSUMABLE" | "EQUIPMENT";
export type InventoryUnitType = "COUNT";
export type InventoryTransactionType = "IN" | "OUT";
export type InventoryTransactionReason = "PURCHASE" | "CONSUME" | "BORROW" | "RETURN" | "SOLD";
export type InventoryBorrowingStatus = "BORROWED" | "RETURNED" | "SOLD";

export interface InventoryUnit {
	id: string;
	name: string;
	descr: string;
	type: InventoryUnitType;
}

export interface InventoryItem {
	id: string;
	code: string;
	name: string;
	type: InventoryItemType;
	unit: InventoryUnit;
	quantityOnHand: number;
	alertThreshold: number;
}

export interface CreateInventoryItem {
	name: string;
	type: string;
	unitId: string;
	quantityOnHand: number;
	alertThreshold: number;
}

export interface UpdateStockRequest {
	quantity: number;
	reason: string;
	memo: string;
	expense?: number;
}

export interface InventoryTransaction {
	id: string;
	itemId: string;
	quantity: number;
	type: InventoryTransactionType;
	reason: InventoryTransactionReason;
	memo: string;
	expense?: number;
	createdAt: string;
	equipmentBorrowId: string;
	createdById: string;
}

export interface InventoryBorrowing {
	id: string;
	itemId: string | null;
	customerId: string | null;
	customerName: string;
	quantity: number;
	borrowDate: string;
	expectedReturnDate: string;
	actualReturnDate?: string;
	status: InventoryBorrowingStatus;
}

export interface CreateBorrowingRequest {
	customerId: string;
	quantity: number;
	expectedReturnDate: string;
	memo: string;
}

export interface SellEquipmentRequest {
	refCode: string;
	expense?: number;
}
