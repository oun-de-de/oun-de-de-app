import { useQuery } from "@tanstack/react-query";
import customerService from "@/core/api/services/customer-service";

type UseGetCustomersParams = {
	page?: number;
	limit?: number;
};

export const useGetCustomers = ({ page = 1, limit = 1000 }: UseGetCustomersParams = {}) => {
	return useQuery({
		queryKey: ["customers-list", { page, limit }],
		queryFn: () => customerService.getCustomerList({ page, limit }),
	});
};
