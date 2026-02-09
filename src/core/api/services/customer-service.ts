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
	code?: string;
	sort?: string;
	status?: string;
	customerType?: string;
}): Promise<Pagination<Customer>> =>
	apiClient
		.get<PaginatedResponse<Customer>>({
			url: CustomerApi.List,
			params: {
				page: params?.page ? params.page - 1 : 0,
				size: params?.limit,
				name: params?.name,
				code: params?.code,
				sort: params?.sort,
				status: params?.status,
				customerType: params?.customerType,
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

const createProductSetting = (customerId: string, setting: CreateProductSettings) =>
	apiClient.post<ProductSettings>({
		url: `${CustomerApi.List}/${customerId}/product-settings`,
		data: setting,
	});

const updateProductSetting = (customerId: string, productId: string, setting: CreateProductSettings) =>
	apiClient.put<ProductSettings>({
		url: `${CustomerApi.List}/${customerId}/product-settings/${productId}`,
		data: setting,
	});

const deleteProductSetting = (customerId: string, productId: string) =>
	apiClient.delete({
		url: `${CustomerApi.List}/${customerId}/product-settings/${productId}`,
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
	getProductSettings,
	createProductSetting,
	updateProductSetting,
	deleteProductSetting,
};
