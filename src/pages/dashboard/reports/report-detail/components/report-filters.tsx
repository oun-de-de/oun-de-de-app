import customerService from "@/core/api/services/customer-service";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import type { ReportFilterConfig } from "../report-types";

export type ReportFiltersValue = {
	customerId: string;
	fromDate: string;
	toDate: string;
	useDateRange: boolean;
};

type ReportFiltersProps = {
	value: ReportFiltersValue;
	onChange: (value: ReportFiltersValue) => void;
	onSubmit: () => void;
	onReset: () => void;
	hasPendingChanges: boolean;
	filterConfig: ReportFilterConfig;
};

export const ReportFilters = React.memo(function ReportFilters({
	value,
	onChange,
	onSubmit,
	onReset,
	hasPendingChanges,
	filterConfig,
}: ReportFiltersProps) {
	const { customerId, fromDate, toDate, useDateRange } = value;
	const { data: customersResponse } = useQuery({
		queryKey: ["report", "customer-list", "all"],
		queryFn: () => customerService.getCustomerList({ limit: 10000 }),
		enabled: filterConfig.customer,
	});
	const customers = customersResponse?.list ?? [];
	const hasCustomerAndDateRange = filterConfig.customer && filterConfig.dateRange;
	const hasDateFilter = filterConfig.dateRange || filterConfig.singleDate || filterConfig.monthOnly;
	const helperSpanClass = hasCustomerAndDateRange || hasDateFilter ? "lg:col-span-2" : "lg:col-span-1";

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{filterConfig.customer && (
				<div className={hasCustomerAndDateRange ? "lg:col-span-2 flex flex-col gap-1.5" : "flex flex-col gap-1.5"}>
					<Label htmlFor="customer" className="text-slate-600">
						Customer
					</Label>
					<Select
						value={customerId}
						onValueChange={(nextCustomerId) => {
							onChange({
								customerId: nextCustomerId,
								fromDate,
								toDate,
								useDateRange,
							});
						}}
					>
						<SelectTrigger id="customer" className="h-10 text-slate-500">
							<SelectValue placeholder="Select customer" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							{customers.map((customer) => (
								<SelectItem key={customer.id} value={customer.id}>
									{customer.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{filterConfig.dateRange && (
				<div className="flex flex-col gap-1.5 text-red-500">
					<Label htmlFor="report-date-from" className="text-slate-600">
						* From
					</Label>
					<Input
						id="report-date-from"
						type="date"
						value={fromDate}
						onChange={(e) => onChange({ customerId, fromDate: e.target.value, toDate, useDateRange: true })}
						className="h-10 text-slate-500"
					/>
				</div>
			)}

			{filterConfig.dateRange && (
				<div className="flex flex-col gap-1.5 text-red-500">
					<Label htmlFor="report-date-to" className="text-slate-600">
						* To
					</Label>
					<Input
						id="report-date-to"
						type="date"
						value={toDate}
						onChange={(e) => onChange({ customerId, fromDate, toDate: e.target.value, useDateRange: true })}
						className="h-10 text-slate-500"
					/>
				</div>
			)}

			{filterConfig.singleDate && (
				<div className="flex flex-col gap-1.5 text-red-500">
					<Label htmlFor="report-date" className="text-slate-600">
						* Date
					</Label>
					<Input
						id="report-date"
						type="date"
						value={fromDate}
						onChange={(e) =>
							onChange({
								customerId,
								fromDate: e.target.value,
								toDate: e.target.value,
								useDateRange: true,
							})
						}
						className="h-10 text-slate-500"
					/>
				</div>
			)}

			{filterConfig.monthOnly && (
				<div className="flex flex-col gap-1.5 text-red-500">
					<Label htmlFor="report-month" className="text-slate-600">
						* Month
					</Label>
					<Input
						id="report-month"
						type="month"
						value={fromDate}
						onChange={(e) =>
							onChange({
								customerId,
								fromDate: e.target.value,
								toDate: e.target.value,
								useDateRange: true,
							})
						}
						className="h-10 text-slate-500"
					/>
				</div>
			)}

			<div className={`${helperSpanClass} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
				<p
					className={
						hasPendingChanges
							? "rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700"
							: "text-sm text-slate-500"
					}
				>
					{hasPendingChanges ? "Filter changes are not applied yet." : "Displayed data matches the current filters."}
				</p>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" className="h-10 px-6" onClick={onReset} disabled={!hasPendingChanges}>
						Reset
					</Button>
					<Button
						type="button"
						className="h-10 bg-sky-500 px-9 hover:bg-sky-600"
						onClick={onSubmit}
						disabled={!hasPendingChanges}
					>
						Submit
					</Button>
				</div>
			</div>
		</div>
	);
});
