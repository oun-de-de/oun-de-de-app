import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import employeeService from "@/core/api/services/employee-service";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Employee } from "@/core/types/employee";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { EmployeeContent } from "./components/employee-content";
import { EmployeeSidebar } from "./components/employee-sidebar";
import { useEmployeeState } from "./stores/employee-store";
import { getEmployeeDisplayName } from "./utils/employee-utils";

export default function EmployeesPage() {
	const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
	const listState = useEmployeeState();
	const { isCollapsed, handleToggle } = useSidebarCollapse();

	// clear active employee when user starts searching
	useEffect(() => {
		if (listState.searchValue && activeEmployee) {
			setActiveEmployee(null);
		}
	}, [listState.searchValue, activeEmployee]);

	const { data: employees = [], isLoading } = useQuery({
		queryKey: [
			"employees",
			listState.page,
			listState.pageSize,
			listState.searchValue,
			listState.fieldFilter,
			activeEmployee?.id,
		],
		queryFn: () => employeeService.getEmployeeList(),
	});

	const filteredEmployees = employees.filter((employee) => {
		const query = (listState.searchValue || "").toLowerCase();
		if (!query) return true;

		const field = listState.fieldFilter;
		const username = (employee?.username || "").toLowerCase();
		const firstName = (employee?.firstName || "").toLowerCase();
		const lastName = (employee?.lastName || "").toLowerCase();
		const displayName = getEmployeeDisplayName(employee).toLowerCase();

		if (field === "username") return username.includes(query);
		if (field === "firstName") return firstName.includes(query);
		if (field === "lastName") return lastName.includes(query);

		return displayName.includes(query) || username.includes(query);
	});

	// For now we do client-side pagination since backend might not support it yet for employees
	const totalItems = filteredEmployees.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / listState.pageSize));
	const currentPage = Math.min(listState.page, totalPages);

	const pagedEmployees = filteredEmployees.slice(
		(currentPage - 1) * listState.pageSize,
		currentPage * listState.pageSize,
	);

	const paginationItems = buildPagination(currentPage, totalPages);

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20" : "lg:w-1/4"}
			sidebar={
				<EmployeeSidebar
					activeEmployeeId={activeEmployee?.id || null}
					onSelect={setActiveEmployee}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
				/>
			}
			content={
				<EmployeeContent
					activeEmployee={activeEmployee}
					pagedData={pagedEmployees}
					totalItems={totalItems}
					totalPages={totalPages}
					currentPage={currentPage}
					paginationItems={paginationItems}
					isLoading={isLoading}
				/>
			}
		/>
	);
}
