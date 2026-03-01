import { useMemo } from "react";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";
import { useGetCustomers } from "./use-get-customers";
import { useGetEmployees } from "./use-get-employees";

export const useFormOptions = () => {
	const { data: employees } = useGetEmployees({ page: 0, size: 1000 });
	const { data: customersList } = useGetCustomers({ page: 1, limit: 1000 });

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

	return { employeeOptions, customerOptions };
};
