export type Unit = {
	id: string;
	name: string;
	descr: string;
	type: string;
};

export type DefaultProductSetting = {
	id: string;
	price: number;
	quantity: number;
};

export type Product = {
	id: string;
	name: string;
	date: string;
	refNo: string;
	isPackagedByQuantity?: boolean;
	quantity: number;
	cost: number;
	price: number;
	unit: Unit;
	defaultProductSetting: DefaultProductSetting;
};

export type CreateProductRequest = {
	name: string;
	unitId?: string;
	defaultPrice: number;
	defaultQuantity: number;
	isPackagedByQuantity?: boolean;
};

export type UpdateProduct = Partial<Omit<Product, "id" | "unit" | "defaultProductSetting">> & {
	unitId: string;
	defaultPrice: number;
	defaultQuantity: number;
	isPackagedByQuantity?: boolean;
};
