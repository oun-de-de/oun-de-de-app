import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import type { Coupon } from "@/core/types/coupon";
import { getVehicleTypeLabel } from "@/core/types/vehicle";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";

type CouponColumnsOptions = {
	onViewWeightRecords: (coupon: Coupon) => void;
	onDeleteCoupon: (coupon: Coupon) => void;
	onEditCoupon: (coupon: Coupon) => void;
};

export const getCouponColumns = ({
	onViewWeightRecords,
	onDeleteCoupon,
	onEditCoupon,
}: CouponColumnsOptions): ColumnDef<Coupon>[] => [
	{
		header: "Coupon Id",
		accessorKey: "id",
	},
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
		size: 120,
		cell: ({ row }) => formatDisplayDate(row.original.date),
	},
	{
		header: "Customer",
		accessorKey: "customerName",
		cell: ({ row }) => row.original.customerName || "-",
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
		header: "Weight Records",
		size: 150,
		cell: ({ row }) => {
			const records = row.original.weightRecords;
			const count = records?.length ?? 0;
			return (
				<Button size="sm" variant="link" onClick={() => onViewWeightRecords(row.original)}>
					{count > 0 ? `View ${count} records` : "View records"}
				</Button>
			);
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
		header: "Employee",
		accessorFn: (row) => row.employee?.username,
		cell: ({ row }) => {
			const emp = row.original.employee;
			if (!emp) return "-";
			return getEmployeeDisplayName(emp);
		},
	},
	{
		header: "Invoice Ref",
		accessorKey: "invoiceRefNo",
		cell: ({ row }) => {
			const invoiceRefNo = row.original.invoiceRefNo;
			const cycleId = row.original.paymentTermCycleId;

			if (!invoiceRefNo) return "-";
			if (!cycleId) return invoiceRefNo;

			return (
				<Link
					to={`/dashboard/invoice?cycleId=${cycleId}`}
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					{invoiceRefNo}
				</Link>
			);
		},
	},
	{
		header: "Coupon ID",
		accessorKey: "couponId",
		cell: ({ row }) => (row.original.couponId != null ? row.original.couponId : "-"),
		meta: {
			bodyClassName: "text-center",
		},
	},
	// {
	//   header: 'Acc No.',
	//   accessorKey: 'accNo',
	//   cell: ({ row }) => row.original.accNo || '-',
	// },
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
		header: "Actions",
		cell: ({ row }) => {
			const isDeleted = Boolean(row.original.delAccNo?.trim());
			return (
				<div className="flex items-center justify-center gap-2">
					<Button
						size="sm"
						variant="warning"
						onClick={() => onEditCoupon(row.original)}
						disabled={!row.original.couponNo || isDeleted}
					>
						Edit
					</Button>
					<Button
						size="sm"
						variant="destructive"
						className="text-white"
						onClick={() => onDeleteCoupon(row.original)}
						disabled={!row.original.couponNo || isDeleted}
					>
						Delete
					</Button>
				</div>
			);
		},
		meta: {
			bodyClassName: "text-center",
		},
	},
];
