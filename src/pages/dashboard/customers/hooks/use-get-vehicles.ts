import { useQuery } from "@tanstack/react-query";
import customerService from "@/core/api/services/customer-service";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";

export const useGetCustomerVehicles = (customerId?: string) => {
	return useQuery({
		queryKey: CUSTOMER_QUERY_KEYS.vehicles(customerId),
		queryFn: () => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.getCustomerVehicleList(customerId);
		},
		enabled: !!customerId,
	});
};
