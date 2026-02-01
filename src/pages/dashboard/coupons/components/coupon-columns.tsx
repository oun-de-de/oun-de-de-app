import type { ColumnDef } from "@tanstack/react-table";
import type { Coupon } from "@/core/types/coupon";

export const columns: ColumnDef<Coupon>[] = [
	{
		header: "ID",
		accessorKey: "id",
		cell: ({ row }) => <span className="font-semibold text-sky-600">#{row.original.id.slice(0, 8)}</span>,
	},
	{
		header: "Date",
		accessorKey: "date",
		cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
	},
	{
		header: "Plate Number",
		accessorFn: (row) => row.vehicle?.licensePlate,
		cell: ({ row }) => (
			<span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium">
				{row.original.vehicle?.licensePlate ?? "-"}
			</span>
		),
	},
	{
		header: "Vehicle Type",
		accessorFn: (row) => row.vehicle?.vehicleType,
		cell: ({ row }) => row.original.vehicle?.vehicleType ?? "-",
	},
	{
		header: "Driver",
		accessorKey: "driverName",
	},
	{
		header: "Employee",
		accessorFn: (row) => row.employee?.username,
		cell: ({ row }) => {
			const emp = row.original.employee;
			if (!emp) return "-";
			return emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.username;
		},
	},
	{
		header: "Weight Records",
		cell: ({ row }) => {
			const records = row.original.weightRecords;
			if (!records || records.length === 0) return "-";
			return <span className="font-medium">{records.length} records</span>;
		},
	},
	{
		header: "Total Weight",
		cell: ({ row }) => {
			const records = row.original.weightRecords;
			if (!records || records.length === 0) return "-";
			const total = records.reduce((sum, r) => sum + r.weight, 0);
			return <span className="font-semibold text-emerald-600">{total.toLocaleString()} kg</span>;
		},
	},
	{
		header: "Remark",
		accessorKey: "remark",
		cell: ({ row }) => row.original.remark || "-",
	},
];
