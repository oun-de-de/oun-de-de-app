import { queryOptions, useQuery } from "@tanstack/react-query";
import customerService from "@/core/api/services/customer-service";

export const customerQueryOptions = (id?: string) =>
	queryOptions({
		queryKey: ["customer", id],
		queryFn: () => {
			if (!id) throw new Error("Customer ID is required");
			return customerService.getCustomer(id);
		},
		enabled: !!id,
	});

export const useGetCustomer = (id?: string) => {
	return useQuery(customerQueryOptions(id));
};
