import type { Coupon, WeightRecord } from "@/core/types/coupon";
import { Badge } from "@/core/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { formatDisplayDateTime, formatNumber } from "@/core/utils/formatters";

type CouponWeightRecordsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	coupon: Coupon | null;
	weightRecords: WeightRecord[];
	isLoading: boolean;
};

export function CouponWeightRecordsDialog({
	open,
	onOpenChange,
	coupon,
	weightRecords,
	isLoading,
}: CouponWeightRecordsDialogProps) {
	const totalWeight = weightRecords.reduce((sum, record) => sum + (record.weight ?? 0), 0);
	const totalAmount = weightRecords.reduce((sum, record) => sum + (record.amount ?? 0), 0);
	const employeeDisplayName = coupon?.employee
		? `${coupon.employee.firstName ?? ""} ${coupon.employee.lastName ?? ""}`.trim() || coupon.employee.username
		: "-";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-6xl max-h-[85vh] overflow-y-auto overscroll-contain">
				<DialogHeader className="pr-8">
					<DialogTitle>Coupon Weight Records</DialogTitle>
					<DialogDescription className="md:text-base">
						{coupon
							? `Coupon #${coupon.couponNo ?? "-"} • Plate Number: ${coupon.vehicle?.licensePlate ?? "No plate"}`
							: "Weight records"}
					</DialogDescription>
				</DialogHeader>

				{coupon ? (
					<div className="space-y-4">
						{/* <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
							<div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-white p-4">
								<div className="text-xs font-semibold uppercase tracking-wide text-sky-500">Records</div>
								<div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{formatNumber(weightRecords.length, "0")}</div>
							</div>
							<div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-4">
								<div className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Total Weight</div>
								<div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{formatNumber(totalWeight, "0")} kg</div>
							</div>
							<div className="rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-white p-4">
								<div className="text-xs font-semibold uppercase tracking-wide text-amber-500">Total Amount</div>
								<div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{formatNumber(totalAmount, "-")}</div>
							</div>
						</div> */}

						<div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
							<div>
								<div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</div>
								<div className="mt-1 font-medium text-slate-900">{coupon.customerName || "-"}</div>
							</div>
							<div>
								<div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Driver</div>
								<div className="mt-1 font-medium text-slate-900">{coupon.driverName || "-"}</div>
							</div>
							<div>
								<div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Employee</div>
								<div className="mt-1 font-medium text-slate-900">{employeeDisplayName}</div>
							</div>
							<div>
								<div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Invoice Ref</div>
								<div className="mt-1 font-medium text-slate-900">{coupon.invoiceRefNo || "-"}</div>
							</div>
							<div>
								<div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coupon Date</div>
								<div className="mt-1 font-medium text-slate-900">{formatDisplayDateTime(coupon.date)}</div>
							</div>
							<div>
								<div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Remark</div>
								<div className="mt-1 font-medium text-slate-900">{coupon.remark || "-"}</div>
							</div>
						</div>
					</div>
				) : null}

				{isLoading ? (
					<div className="py-8 text-center text-sm text-muted-foreground">Loading weight records…</div>
				) : weightRecords.length === 0 ? (
					<div className="py-8 text-center text-sm text-muted-foreground">No weight records found for this coupon.</div>
				) : (
					<div className="overflow-hidden rounded-xl border border-slate-200">
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead className="sticky top-0 bg-slate-100/95 backdrop-blur">
									<tr>
										<th className="border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700 last:border-r-0">
											Product
										</th>
										<th className="border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700 last:border-r-0">
											Unit
										</th>
										<th className="border-r border-slate-200 px-3 py-3 text-right font-semibold text-slate-700 last:border-r-0">
											Qty/Product
										</th>
										<th className="border-r border-slate-200 px-3 py-3 text-right font-semibold text-slate-700 last:border-r-0">
											Qty
										</th>
										<th className="border-r border-slate-200 px-3 py-3 text-right font-semibold text-slate-700 last:border-r-0">
											Weight
										</th>
										<th className="border-r border-slate-200 px-3 py-3 text-right font-semibold text-slate-700 last:border-r-0">
											Price
										</th>
										<th className="border-r border-slate-200 px-3 py-3 text-right font-semibold text-slate-700 last:border-r-0">
											Amount
										</th>
										<th className="border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700 last:border-r-0">
											Out Time
										</th>
										<th className="border-r border-slate-200 px-3 py-3 text-center font-semibold text-slate-700 last:border-r-0">
											Source
										</th>
										<th className="px-3 py-3 text-left font-semibold text-slate-700">Memo</th>
									</tr>
								</thead>
								<tbody>
									{weightRecords.map((record, index) => (
										<tr
											key={record.id ?? `${record.outTime}-${index}`}
											className="border-t align-top odd:bg-white even:bg-slate-50/50"
										>
											<td className="border-r border-slate-200 px-3 py-3 font-medium text-slate-900 last:border-r-0">
												{record.productName || "-"}
											</td>
											<td className="border-r border-slate-200 px-3 py-3 text-slate-600 last:border-r-0">
												{record.unit || "-"}
											</td>
											<td className="border-r border-slate-200 px-3 py-3 text-right tabular-nums text-slate-700 last:border-r-0">
												{formatNumber(record.quantityPerProduct, "-")}
											</td>
											<td className="border-r border-slate-200 px-3 py-3 text-right tabular-nums text-slate-700 last:border-r-0">
												{formatNumber(record.quantity, "-")}
											</td>
											<td className="border-r border-slate-200 px-3 py-3 text-right font-medium tabular-nums text-slate-900 last:border-r-0">
												{record.weight == null ? "-" : `${formatNumber(record.weight)} kg`}
											</td>
											<td className="border-r border-slate-200 px-3 py-3 text-right tabular-nums text-slate-700 last:border-r-0">
												{formatNumber(record.pricePerProduct, "-")}
											</td>
											<td className="border-r border-slate-200 px-3 py-3 text-right font-medium tabular-nums text-slate-900 last:border-r-0">
												{formatNumber(record.amount, "-")}
											</td>
											<td className="border-r border-slate-200 px-3 py-3 tabular-nums text-slate-700 last:border-r-0">
												{formatDisplayDateTime(record.outTime)}
											</td>
											<td className="border-r border-slate-200 px-3 py-3 text-center last:border-r-0">
												<Badge variant={record.manual ? "info" : "secondary"}>
													{record.manual ? "Manual" : "System"}
												</Badge>
											</td>
											<td className="max-w-[16rem] break-words px-3 py-3 text-slate-700">{record.memo || "-"}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
							<div className="flex flex-wrap items-center justify-end gap-6 text-sm">
								<div className="flex items-center gap-3 rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
									<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Weight</span>
									<span className="text-lg font-semibold tabular-nums text-slate-900">
										{weightRecords.length > 0 ? `${formatNumber(totalWeight)} kg` : "-"}
									</span>
								</div>
								<div className="flex items-center gap-3 rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
									<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Amount</span>
									<span className="text-lg font-semibold tabular-nums text-slate-900">
										{weightRecords.length > 0 ? formatNumber(totalAmount, "-") : "-"}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
