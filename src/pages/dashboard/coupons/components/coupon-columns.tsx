import type { ColumnDef } from "@tanstack/react-table";
import type { Coupon } from "@/core/types/coupon";
import { getVehicleTypeLabel } from "@/core/types/vehicle";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";

type CouponColumnsOptions = {
	onViewWeightRecords: (coupon: Coupon) => void;
};

export const getCouponColumns = ({ onViewWeightRecords }: CouponColumnsOptions): ColumnDef<Coupon>[] => [
	{
		header: "Coupon No.",
		accessorKey: "couponNo",
		size: 80,
		meta: {
			bodyClassName: "text-center",
		},
	},
	{
		header: "Date",
		accessorKey: "date",
		cell: ({ row }) => formatDisplayDate(row.original.date),
	},
	{
		header: "Status",
		cell: ({ row }) => {
			const isDeleted = Boolean(row.original.delAccNo?.trim());
			return <Badge variant={isDeleted ? "destructive" : "success"}>{isDeleted ? "Deleted" : "Active"}</Badge>;
		},
		meta: {
			bodyClassName: "text-center",
		},
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
			return getVehicleTypeLabel(vehicleType);
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
			const count = records?.length ?? 0;
			return (
				<Button size="sm" variant="link" onClick={() => onViewWeightRecords(row.original)}>
					{count > 0 ? `View ${count} records` : "View records"}
				</Button>
			);
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
