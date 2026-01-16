import apiClient from "../apiClient";
import type { Customer } from "@/core/types/customer";

export enum CustomerApi {
	List = "/api/customers",
}

const getCustomerList = () => apiClient.get<Customer[]>({ url: CustomerApi.List });

export default {
	getCustomerList,
};
