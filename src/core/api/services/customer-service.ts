import type { PaginatedResponse } from "@/core/types/common";
import type {
	CreateCustomer,
	CreateProductSettings,
	Customer,
	CustomerDetail,
	ProductSettings,
	UpdateCustomer,
} from "@/core/types/customer";
import type { Pagination } from "@/core/types/pagination";
import type { CreateVehicle, Vehicle } from "@/core/types/vehicle";
import { mapPaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum CustomerApi {
	List = "/customers",
	Create = "/customers",
	Update = "/customers",
}

const getCustomerList = (params?: {
	page?: number;
	limit?: number;
	name?: string;
	customerType?: string;
	sort?: string;
	paymentTerm?: number;
}): Promise<Pagination<Customer>> =>
	apiClient
		.get<PaginatedResponse<Customer>>({
			url: CustomerApi.List,
			params: {
				page: params?.page ? params.page - 1 : 0,
				size: params?.limit,
				name: params?.name,
				customer_type: params?.customerType,
				sort: params?.sort,
				payment_term: params?.paymentTerm,
			},
		})
		.then(mapPaginatedResponseToPagination);

const getCustomer = (id: string) =>
	apiClient.get<CustomerDetail>({
		url: `${CustomerApi.List}/${id}`,
	});

const createCustomer = (customer: CreateCustomer) =>
	apiClient.post<Customer>({ url: CustomerApi.Create, data: customer });

const updateCustomer = (id: string, customer: UpdateCustomer) =>
	apiClient.put<Customer>({
		url: `${CustomerApi.Update}/${id}`,
		data: customer,
	});

const getCustomerVehicleList = (customerId: string) =>
	apiClient.get<Vehicle[]>({
		url: `${CustomerApi.List}/${customerId}/vehicles`,
	});

const createCustomerVehicle = (customerId: string, vehicle: CreateVehicle) =>
	apiClient.post<Vehicle>({
		url: `${CustomerApi.List}/${customerId}/vehicles`,
		data: vehicle,
	});

const updateCustomerVehicle = (customerId: string, vehicleId: string, vehicle: CreateVehicle) =>
	apiClient.put<Vehicle>({
		url: `${CustomerApi.List}/${customerId}/vehicles/${vehicleId}`,
		data: vehicle,
	});

const createProductSetting = (customerId: string, setting: CreateProductSettings) =>
	apiClient.post<ProductSettings>({
		url: `${CustomerApi.List}/${customerId}/product-settings`,
		data: setting,
	});

const getProductSettings = (customerId: string) =>
	apiClient.get<ProductSettings[]>({
		url: `${CustomerApi.List}/${customerId}/product-settings`,
	});

export default {
	getCustomerList,
	getCustomer,
	createCustomer,
	updateCustomer,
	getCustomerVehicleList,
	createCustomerVehicle,
	updateCustomerVehicle,
	getProductSettings,
	createProductSetting,
};
