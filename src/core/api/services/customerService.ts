import type { PaginatedResponse } from "@/core/types/common";
import type { CreateCustomer, Customer } from "@/core/types/customer";
import type { Pagination } from "@/core/types/pagination";
import { mapPaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum CustomerApi {
	List = "/customers",
	Create = "/customers",
}

const getCustomerList = (params?: {
	page?: number;
	limit?: number;
	name?: string;
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
				sort: params?.sort,
			},
		})
		.then(mapPaginatedResponseToPagination);

const createCustomer = (customer: CreateCustomer) =>
	apiClient.post<Customer>({ url: CustomerApi.Create, data: customer });

export default {
	getCustomerList,
	createCustomer,
};
