import { useMemo } from "react";
import { useGetWarehouseList } from "@/pages/dashboard/settings/hooks/use-settings";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";
import { useGetCustomers } from "./use-get-customers";
import { useGetEmployees } from "./use-get-employees";

export const useFormOptions = () => {
	const { data: employees } = useGetEmployees();
	const { data: customersList } = useGetCustomers({ page: 1, limit: 1000 });
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
