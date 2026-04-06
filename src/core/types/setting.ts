export interface Warehouse {
	id: string;
	name: string;
	descr: string;
	location: string;
}

export interface CreateWarehouse {
	name: string;
	descr: string;
	location: string;
}

export type UnitType = "count" | "length" | "weight" | "volume" | "time";

export interface Unit {
	id: string;
	name: string;
	descr: string;
	type: UnitType;
}

export interface CreateUnit {
	name: string;
	descr: string;
	type: UnitType;
}

export interface Currency {
	id: string;
	name: string;
	descr: string;
}

export interface CreateCurrency {
	name: string;
	descr?: string;
}

export interface Supplier {
	id: string;
	name: string;
	descr: string;
	address: string;
	telephone: string;
}

export interface CreateSupplier {
	name: string;
	descr?: string;
	address?: string;
	telephone?: string;
}
