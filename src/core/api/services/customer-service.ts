import type { PaginatedResponse } from "@/core/types/common";
import type { CreateCustomer, Customer } from "@/core/types/customer";
import type { Pagination } from "@/core/types/pagination";
import type { CreateVehicle, Vehicle } from "@/core/types/vehicle";
import { mapPaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum CustomerApi {
	List = "/customers",
	Create = "/customers",
	VehicleList = "/customers/vehicles",
	VehicleCreate = "/customers/vehicles",
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

const createCustomer = (customer: CreateCustomer) =>
	apiClient.post<Customer>({ url: CustomerApi.Create, data: customer });

const getCustomerVehicleList = (customerId: string) =>
	apiClient.get<Vehicle[]>({
		url: `${CustomerApi.VehicleList}/${customerId}/vehicles`,
	});

const createCustomerVehicle = (customerId: string, vehicle: CreateVehicle) =>
	apiClient.post<Vehicle>({
		url: `${CustomerApi.VehicleCreate}/${customerId}/vehicles`,
		data: vehicle,
	});

const getCustomerById = (id: string) =>
	apiClient.get<Customer>({
		url: `${CustomerApi.List}/${id}`,
	});

const updateCustomer = (id: string, customer: Partial<CreateCustomer>) =>
	apiClient.put<Customer>({
		url: `${CustomerApi.List}/${id}`,
		data: customer,
	});

const deleteCustomer = (id: string) =>
	apiClient.delete<boolean>({
		url: `${CustomerApi.List}/${id}`,
	});

export default {
	getCustomerList,
	createCustomer,
	getCustomerVehicleList,
	createCustomerVehicle,
	getCustomerById,
	updateCustomer,
	deleteCustomer,
};
