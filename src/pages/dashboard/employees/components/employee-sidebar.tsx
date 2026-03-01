import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import employeeService from "@/core/api/services/employee-service";
import { EntityListItem, SidebarList } from "@/core/components/common";
import type { Employee } from "@/core/types/employee";
import { cn } from "@/core/utils";
import { getEmployeeDisplayName } from "../utils/employee-utils";

type EmployeeSidebarProps = {
	activeEmployeeId: string | null;
	onSelect: (employee: Employee | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

const DEFAULT_ITEM_SIZE = 56;
const COLLAPSED_ITEM_SIZE = 42;
const COLLAPSED_ITEM_GAP = 8;

export function EmployeeSidebar({ activeEmployeeId, onSelect, onToggle, isCollapsed }: EmployeeSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");

	const { data: employees = [] } = useQuery({
		queryKey: ["employees", "sidebar", { searchTerm }],
		queryFn: () => employeeService.getEmployeeList(),
	});

	const filteredEmployees = employees.filter((employee) =>
		getEmployeeDisplayName(employee)
			.toLowerCase()
			.includes((searchTerm || "").toLowerCase()),
	);

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={false}
				showStatusFilter={false}
				onMenuClick={onToggle}
				searchPlaceholder="Search employees..."
				onSearchChange={setSearchTerm}
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				key={isCollapsed ? "collapsed" : "expanded"}
				className={cn("mt-2 flex-1 min-h-0", !isCollapsed && "divide-y divide-border-gray-300")}
				data={filteredEmployees}
				estimateSize={isCollapsed ? COLLAPSED_ITEM_SIZE : DEFAULT_ITEM_SIZE}
				gap={isCollapsed ? COLLAPSED_ITEM_GAP : 0}
				height="100%"
				renderItem={(employee: Employee, style) => (
					<EntityListItem
						key={employee.id}
						entity={{
							id: employee.id,
							name: getEmployeeDisplayName(employee),
							code: employee.username,
						}}
						isActive={employee.id === activeEmployeeId}
						onSelect={() => onSelect(employee.id === activeEmployeeId ? null : employee)}
						style={style}
						isCollapsed={isCollapsed}
					/>
				)}
			/>

			<SidebarList.Footer total={filteredEmployees.length} isCollapsed={isCollapsed} showControls={false} />
		</SidebarList>
	);
}
