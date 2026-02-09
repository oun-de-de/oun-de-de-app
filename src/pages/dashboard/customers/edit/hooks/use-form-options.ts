import { useMemo } from "react";
import { useGetCustomers } from "../../hooks/use-get-customers";
import { useGetEmployees } from "../../hooks/use-get-employees";

export const useFormOptions = () => {
	const { data: employees } = useGetEmployees({ page: 0, size: 100 });
	const { data: customersList } = useGetCustomers({ page: 1, limit: 1000 });

	const employeeOptions = useMemo(
		() =>
			(employees || []).map((emp) => ({
				label: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.username,
				value: emp.id,
			})),
		[employees],
	);

	const customerOptions = useMemo(
		() => (customersList?.list?.length ? customersList.list.map((cus) => ({ label: cus.name, value: cus.id })) : []),
		[customersList],
	);

	return { employeeOptions, customerOptions };
};
