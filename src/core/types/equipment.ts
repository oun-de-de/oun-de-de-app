export type EquipmentItemId = "inventory-bag" | "ice-cabinet" | "equipment-tools";
export type TransactionType = "stock-in" | "stock-out-borrow";

export type EquipmentItem = {
	id: EquipmentItemId;
	name: string;
	category: string;
	openingStock: number;
	alertThreshold: number;
	maxBorrowQuantity?: number;
	maxTotalBorrow?: number;
};

export type EquipmentCreateType = "consumable" | "equipment";
