import type { ColumnDef } from "@tanstack/react-table";
import type { Employee } from "@/core/types/employee";
import { Button } from "@/core/ui/button";

export const columns = (onEdit: (employee: Employee) => void): ColumnDef<Employee>[] => [
	{
		accessorKey: "username",
		header: "Username",
	},
	{
		accessorKey: "firstName",
		header: "First Name",
	},
	{
		accessorKey: "lastName",
		header: "Last Name",
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Button variant="warning" size="sm" onClick={() => onEdit(row.original)} title="Edit">
					Edit
				</Button>
			</div>
		),
	},
];
