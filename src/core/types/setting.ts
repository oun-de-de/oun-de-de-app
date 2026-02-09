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

export enum UnitType {
	COUNT = "count",
	LENGTH = "length",
	WEIGHT = "weight",
	VOLUME = "volume",
	TIME = "time",
}

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
