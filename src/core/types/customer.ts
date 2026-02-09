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

// Omit to remove old field
export interface CustomerDetail
	extends Omit<
		Customer,
		| "telephone"
		| "email"
		| "geography"
		| "address"
		| "location"
		| "map"
		| "billingAddress"
		| "deliveryAddress"
		| "employeeId"
		| "referredBy"
	> {
	customerReference?: {
		id: string;
		name: string;
	};
	contact: {
		id: string;
		telephone: string;
		email: string;
		geography: string;
		address: string;
		location: string;
		map: string;
		billingAddress: string;
		deliveryAddress: string;
	};
	employee: {
		id: string;
		username: string;
		firstName: string | null;
		lastName: string | null;
	};
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
	referredById?: string;
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

export interface UpdateCustomer {
	registerDate?: string;
	name?: string;
	status?: boolean;
	referredById?: string;
	defaultPrice?: string;
	warehouse?: string;
	memo?: string;
	profileUrl?: string;
	shopBannerUrl?: string;
	employeeId?: string;
	telephone?: string;
	email?: string;
	geography?: string;
	address?: string;
	location?: string;
	map?: string;
	billingAddress?: string;
	deliveryAddress?: string;
}

export interface ProductSettings {
	productId: string;
	customerId: string;
	price: number;
	unit: string;
	quantity: number;
}

export interface CreateProductSettings {
	productId: string;
	unit: string;
	quantity: number;
	price: number;
}
