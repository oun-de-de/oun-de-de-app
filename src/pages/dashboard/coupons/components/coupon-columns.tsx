import type { ColumnDef } from "@tanstack/react-table";
import type { Coupon } from "@/core/types/coupon";
import { Badge } from "@/core/ui/badge";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";

const mappingVehicleType: Record<string, string> = {
	TUK_TUK: "Tuk Tuk",
	TRUCK: "Truck",
	OTHER: "Other",
};

export const columns: ColumnDef<Coupon>[] = [
	{
		header: "No",
		size: 60,
		cell: ({ row, table }) => {
			const { pageIndex, pageSize } = table.getState().pagination;
			return pageIndex * pageSize + row.index + 1;
		},
		meta: {
			bodyClassName: "text-center",
		},
	},
	{
		header: "ID",
		accessorKey: "id",
		cell: ({ row }) => <span className="font-semibold text-sky-600">{row.original.id.slice(0, 8)}</span>,
	},
	{
		header: "Date",
		accessorKey: "date",
		cell: ({ row }) => formatDisplayDate(row.original.date),
	},
	{
		header: "Plate Number",
		accessorFn: (row) => row.vehicle?.licensePlate,
		cell: ({ row }) => <Badge>{row.original.vehicle?.licensePlate ?? "-"}</Badge>,
		meta: {
			bodyClassName: "text-center",
		},
	},
	{
		header: "Vehicle Type",
		accessorFn: (row) => row.vehicle?.vehicleType,
		cell: ({ row }) => {
			const vehicleType = row.original.vehicle?.vehicleType;
			return vehicleType ? (mappingVehicleType[vehicleType] ?? vehicleType) : "-";
		},
		meta: {
			bodyClassName: "text-center",
		},
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
			return getEmployeeDisplayName(emp);
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
		header: "Remark",
		accessorKey: "remark",
		cell: ({ row }) => row.original.remark || "-",
	},
	{
		header: "Total Weight",
		cell: ({ row }) => {
			const records = row.original.weightRecords;
			if (!records || records.length === 0) return "-";
			const total = records.reduce((sum, r) => sum + (r.weight ?? 0), 0);
			return <span className="font-semibold text-emerald-600">{formatNumber(total)} kg</span>;
		},
		meta: {
			bodyClassName: "text-right",
		},
	},
];
