import type { ColumnDef } from "@tanstack/react-table";
import type { CouponRow } from "@/core/types/common";

export const columns: ColumnDef<CouponRow>[] = [
	{
		header: "Coupon No",
		accessorKey: "couponNo",
		cell: ({ row }) => <span className="font-semibold text-sky-600">#{row.original.couponNo}</span>,
	},
	{
		header: "Date",
		accessorKey: "couponDate",
	},
	{
		header: "Plate Number",
		accessorKey: "plateNumber",
		cell: ({ row }) => (
			<span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium">{row.original.plateNumber}</span>
		),
	},
	{
		header: "Customer",
		accessorKey: "customerName",
	},
	{
		header: "Driver",
		accessorKey: "driverName",
	},
	{
		header: "In Weight (Kg)",
		accessorKey: "inWeight",
		cell: ({ row }) => (row.original.inWeight ? row.original.inWeight.toLocaleString() : "-"),
	},
	{
		header: "Out Weight (Kg)",
		cell: ({ row }) => {
			const out = row.original.out1Weight || row.original.out2Weight;
			return out ? out.toLocaleString() : "-";
		},
	},
	{
		header: "Net Weight (Kg)",
		cell: ({ row }) => {
			const inW = row.original.inWeight || 0;
			const outW = row.original.out1Weight || row.original.out2Weight;

			if (!outW) return "-";

			const net = Math.abs(inW - outW);
			return net > 0 ? <span className="font-semibold text-emerald-600">{net.toLocaleString()}</span> : "-";
		},
	},
	{
		header: "Status",
		cell: ({ row }) => {
			const hasOut = row.original.out1Weight || row.original.out2Weight;
			return hasOut ? (
				<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Completed</span>
			) : (
				<span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Pending</span>
			);
		},
	},
];
