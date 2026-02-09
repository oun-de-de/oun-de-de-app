import { useQuery } from "@tanstack/react-query";
import customerService from "@/core/api/services/customer-service";

export const useGetCustomerVehicles = (customerId?: string) => {
	return useQuery({
		queryKey: ["customer-vehicles", customerId],
		queryFn: () => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.getCustomerVehicleList(customerId);
		},
		enabled: !!customerId,
	});
};
