import type { QueryClient } from "@tanstack/react-query";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";

export const invalidateCustomerDetailQueries = (queryClient: QueryClient, customerId?: string) => {
	if (!customerId) return;

	queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.detail(customerId) });
};

export const invalidateCustomerListQueries = (queryClient: QueryClient) => {
	queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.all });
};

export const invalidateCustomerVehiclesQueries = (queryClient: QueryClient, customerId?: string) => {
	if (!customerId) return;

	queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.vehicles(customerId) });
	invalidateCustomerDetailQueries(queryClient, customerId);
};

export const invalidateCustomerInfoQueries = (queryClient: QueryClient, customerId?: string) => {
	invalidateCustomerDetailQueries(queryClient, customerId);
	invalidateCustomerListQueries(queryClient);
};
