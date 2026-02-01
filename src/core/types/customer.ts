import type { CreateVehicle, Vehicle } from "./vehicle";

export interface Customer {
	id: string;
	registerDate: string;
	code: string;
	name: string;
	status: boolean;
	customerType: string;
	defaultPrice: string;
	warehouse: string;
	memo: string;
	profileUrl: string;
	shopBannerUrl: string;
	employeeId: string;
	telephone: string;
	email: string;
	geography: string;
	address: string;
	location: string;
	map: string;
	billingAddress: string;
	deliveryAddress: string;
	vehicles: Vehicle[];
}

export interface CreateCustomer {
	registerDate: string;
	code: string;
	name: string;
	status: boolean;
	customerType: string;
	defaultPrice: string;
	warehouse: string;
	memo: string;
	profileUrl: string;
	shopBannerUrl: string;
	employeeId: string;
	telephone: string;
	email: string;
	geography: string;
	address: string;
	location: string;
	map: string;
	billingAddress: string;
	deliveryAddress: string;
	vehicles: CreateVehicle[];
}
