import { useNavigate } from "react-router";
import { SmartDataTable } from "@/core/components/common";
import type { Employee } from "@/core/types/employee";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { useEmployeeActions, useEmployeeState } from "../stores/employee-store";
import { FILTER_FIELD_OPTIONS, FILTER_TYPE_OPTIONS, getEmployeeDisplayName } from "../utils/employee-utils";
import { columns } from "./employee-columns";

type EmployeeContentProps = {
	activeEmployee: Employee | null;
	pagedData: Employee[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
	isLoading?: boolean;
};

export function EmployeeContent({
	activeEmployee,
	pagedData,
	totalItems,
	totalPages,
	currentPage,
	paginationItems,
	isLoading: _isLoading,
}: EmployeeContentProps) {
	const navigate = useNavigate();
	const listState = useEmployeeState();
	const { updateState } = useEmployeeActions();

	const handleEdit = (employee: Employee) => {
		navigate(`/dashboard/employees/edit/${employee.id}`);
	};

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Text variant="body2" className="text-slate-400">
						{activeEmployee ? `${getEmployeeDisplayName(activeEmployee)} selected` : "No Employee Selected"}
					</Text>
				</div>
				<div className="flex items-center gap-2">
					<Button
						onClick={() => navigate("/dashboard/employees/create")}
						size="sm"
						className="gap-2 bg-sky-600 hover:bg-sky-700"
					>
						Add Employee
					</Button>
				</div>
			</div>

			{/* <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{summaryStats.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div> */}

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={pagedData}
				columns={columns(handleEdit)}
				filterConfig={{
					showTypeFilter: false,
					typeOptions: FILTER_TYPE_OPTIONS,
					fieldOptions: FILTER_FIELD_OPTIONS,
					typeValue: listState.typeFilter,
					fieldValue: listState.fieldFilter,
					searchValue: listState.searchValue,
					searchPlaceholder: "Search employees...",
					onTypeChange: (value: string) => updateState({ typeFilter: value, page: 1 }),
					onFieldChange: (value: string) => updateState({ fieldFilter: value, page: 1 }),
					onSearchChange: (value: string) => updateState({ searchValue: value, page: 1 }),
				}}
				paginationConfig={{
					page: currentPage,
					pageSize: listState.pageSize,
					totalItems: totalItems,
					totalPages: totalPages,
					paginationItems: paginationItems,
					onPageChange: (nextPage: number) => updateState({ page: nextPage }),
					onPageSizeChange: (nextSize: number) => updateState({ pageSize: nextSize, page: 1 }),
				}}
			/>
		</>
	);
}
