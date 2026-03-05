import { useQuery } from "@tanstack/react-query";
import React from "react";
import customerService from "@/core/api/services/customer-service";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";

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
};

export const ReportFilters = React.memo(function ReportFilters({
	value,
	onChange,
	onSubmit,
	onReset,
	hasPendingChanges,
}: ReportFiltersProps) {
	const { data: customersResponse } = useQuery({
		queryKey: ["report-filters", "customers"],
		queryFn: () => customerService.getCustomerList({ limit: 1000 }),
	});
	const customers = customersResponse?.list ?? [];

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			{/* <div className="flex flex-col gap-1.5 text-red-500">
				<Label htmlFor="branch" className="text-slate-600">
					* Branch
				</Label>
				<Select defaultValue="01" disabled>
					<SelectTrigger id="branch" className="h-10 text-slate-500">
						<SelectValue placeholder="Select branch" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="01">01 : Phonm Penh</SelectItem>
					</SelectContent>
				</Select>
			</div> */}

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="customer" className="text-slate-600">
					Customer
				</Label>
				<Select value={value.customerId} onValueChange={(customerId) => onChange({ ...value, customerId })}>
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

			<div className="flex flex-col gap-1.5 text-red-500">
				<Label htmlFor="report-date-from" className="text-slate-600">
					* From
				</Label>
				<Input
					id="report-date-from"
					type="date"
					value={value.fromDate}
					onChange={(e) => onChange({ ...value, fromDate: e.target.value, useDateRange: true })}
					className="h-10 text-slate-500"
				/>
			</div>

			<div className="flex flex-col gap-1.5 text-red-500">
				<Label htmlFor="report-date-to" className="text-slate-600">
					* To
				</Label>
				<Input
					id="report-date-to"
					type="date"
					value={value.toDate}
					onChange={(e) => onChange({ ...value, toDate: e.target.value, useDateRange: true })}
					className="h-10 text-slate-500"
				/>
			</div>

			<div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm text-slate-500">
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
