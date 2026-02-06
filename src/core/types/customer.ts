import type { CreateVehicle, Vehicle } from "./vehicle";

export interface Customer {
	id: string;
	registerDate: string;
	code: string;
	name: string;
	status: boolean;
	defaultPrice: string;
	warehouse: string;
	memo: string;
	profileUrl: string;
	referredBy?: string;
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
	depositBalance?: number;
	creditLimit?: number;
	invoiceCount?: number;
	invoiceTotal?: number;
	overdueCount?: number;
	overdueTotal?: number;
}

export interface CreateCustomer {
	registerDate: string;
	code: string;
	name: string;
	status: boolean;
	defaultPrice: string;
	warehouse: string;
	memo: string;
	profileUrl: string;
	referredBy?: string;
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
