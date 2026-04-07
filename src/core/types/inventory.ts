export type InventoryItemType = "CONSUMABLE" | "EQUIPMENT";
export type CreateInventoryItemType = "consumable" | "equipment";
export type InventoryUnitType = "COUNT";
export type InventoryTransactionType = "IN" | "OUT";
export type InventoryTransactionReason = "PURCHASE" | "CONSUME" | "BORROW" | "RETURN" | "SOLD";
export type InventoryTransactionReasonInput = Lowercase<InventoryTransactionReason>;
export type InventoryBorrowingStatus = "BORROWED" | "RETURNED" | "SOLD";

export interface InventoryUnit {
	id: string;
	name: string;
	descr: string;
	type: InventoryUnitType;
}

export interface InventorySupplier {
	id: string;
	name: string;
	descr: string;
	address: string;
	telephone: string;
}

export interface InventoryItem {
	id: string;
	code: string;
	name: string;
	type: InventoryItemType;
	unit: InventoryUnit;
	supplier?: InventorySupplier;
	unitPrice: number;
	quantityOnHand: number;
	alertThreshold: number;
}

export interface InitStockRequest {
	refCode: string;
	quantityOnHand: number;
}

export interface CreateInventoryItem {
	name: string;
	type: CreateInventoryItemType;
	unitId?: string;
	supplierId?: string;
	unitPrice: number;
	initStock?: InitStockRequest;
	alertThreshold?: number;
}

export interface UpdateInventoryItem {
	name?: string;
	type?: CreateInventoryItemType;
	unitId?: string;
	supplierId?: string;
	unitPrice?: number;
	alertThreshold?: number;
}

export interface UpdateStockRequest {
	refCode: string;
	quantity: number;
	reason: InventoryTransactionReasonInput;
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
