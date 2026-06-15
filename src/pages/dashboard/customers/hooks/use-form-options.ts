import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import customerService from "@/core/api/services/customer-service";
import employeeService from "@/core/api/services/employee-service";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";
import { EMPLOYEE_QUERY_KEYS } from "@/core/query-keys/employee-query-keys";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";
import { useGetWarehouseList } from "@/pages/dashboard/settings/hooks/use-settings";

export const useFormOptions = () => {
	const customerListParams = { page: 1, limit: 1000 };
	const { data: employees } = useQuery({
		queryKey: EMPLOYEE_QUERY_KEYS.list(),
		queryFn: () => employeeService.getEmployeeList(),
	});
	const { data: customersList } = useQuery({
		queryKey: CUSTOMER_QUERY_KEYS.list(customerListParams),
		queryFn: () => customerService.getCustomerList(customerListParams),
	});
	const { data: warehouses } = useGetWarehouseList();

	const employeeOptions = useMemo(
		() =>
			(employees || []).map((emp) => ({
				label: getEmployeeDisplayName(emp),
				value: emp.id,
			})),
		[employees],
	);

	const customerOptions = useMemo(() => {
		if (!customersList?.list?.length) {
			return [{ label: "None", value: "none", disabled: true }];
		}

		return customersList.list.map((customer) => ({
			label: customer.name,
			value: customer.id,
		}));
	}, [customersList]);

	const warehouseOptions = useMemo(
		() =>
			(warehouses || []).map((warehouse) => ({
				label: warehouse.name,
				value: warehouse.id,
			})),
		[warehouses],
	);

	return { employeeOptions, customerOptions, warehouseOptions };
};
