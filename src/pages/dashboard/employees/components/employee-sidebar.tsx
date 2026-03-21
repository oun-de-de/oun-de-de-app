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

			{isCollapsed ? (
				<SidebarList.CollapsedHint text="Click to expand employee list" onClick={onToggle} />
			) : (
				<>
					<SidebarList.Body
						key="expanded"
						className={cn("mt-2 flex-1 min-h-0 divide-y divide-border-gray-300")}
						data={filteredEmployees}
						estimateSize={DEFAULT_ITEM_SIZE}
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
							/>
						)}
					/>

					<SidebarList.Footer total={filteredEmployees.length} isCollapsed={false} showControls={false} />
				</>
			)}
		</SidebarList>
	);
}
