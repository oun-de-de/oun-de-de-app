import type { CreateVehicle, Vehicle } from "./vehicle";

export interface PaymentTerm {
	duration: number;
	startDate: string;
}

export interface Customer {
	id: string;
	registerDate: string;
	code: string;
	name: string;
	status: boolean;
	defaultPrice: string;
	warehouseId: string;
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
	paymentTerm?: PaymentTerm;
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
	registerDate: Date;
	name: string;
	status: boolean;
	warehouseId: string;
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
	paymentTerm?: PaymentTerm;
}

export interface UpdateCustomer {
	registerDate?: string;
	name?: string;
	status?: boolean;
	referredById?: string;
	defaultPrice?: string;
	warehouseId?: string;
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
	paymentTerm?: PaymentTerm;
}

export interface ProductSettings {
	productId: string;
	customerId: string;
	price: number;
	quantity: number;
}

export interface CreateProductSettings {
	productId: string;
	quantity: number;
	price: number;
}
