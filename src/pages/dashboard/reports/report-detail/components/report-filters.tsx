import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { memo, type ReactNode, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import employeeService from "@/core/api/services/employee-service";
import productService from "@/core/api/services/product-service";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";
import { EMPLOYEE_QUERY_KEYS } from "@/core/query-keys/employee-query-keys";
import { PRODUCT_QUERY_KEYS } from "@/core/query-keys/product-query-keys";
import type { Customer } from "@/core/types/customer";
import type { Employee } from "@/core/types/employee";
import type { Product } from "@/core/types/product";
import { Avatar, AvatarFallback, AvatarImage } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Calendar } from "@/core/ui/calendar";
import { Checkbox } from "@/core/ui/checkbox";
import { Label } from "@/core/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatDateToYYYYMMDD } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import type { ReportFiltersProps, ReportFiltersValue } from "./report-filter-types";

export type { ReportFiltersValue } from "./report-filter-types";

import { fetchAllCustomers, getCustomersWithinType } from "./report-data-utils";
import { formatFilterDateForDisplay } from "./report-table-utils";

function FilterRow({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
	return (
		<div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3">
			<Label className="text-slate-600">
				{required ? <span className="text-red-500">*</span> : null} {label}
			</Label>
			{children}
		</div>
	);
}

const MONTH_OPTIONS = [
	{ value: "01", label: "January" },
	{ value: "02", label: "February" },
	{ value: "03", label: "March" },
	{ value: "04", label: "April" },
	{ value: "05", label: "May" },
	{ value: "06", label: "June" },
	{ value: "07", label: "July" },
	{ value: "08", label: "August" },
	{ value: "09", label: "September" },
	{ value: "10", label: "October" },
	{ value: "11", label: "November" },
	{ value: "12", label: "December" },
] as const;

function parseReportFilterDate(value?: string) {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return undefined;
	}
	return date;
}

export function getSafeAvatarImageUrl(value?: string | null): string | undefined {
	const trimmedValue = value?.trim();
	if (!trimmedValue) return undefined;

	try {
		const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost";
		const url = new URL(trimmedValue, baseUrl);
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return undefined;
		}
		return trimmedValue;
	} catch {
		return undefined;
	}
}

function parseMonthFilterValue(value?: string) {
	if (!value) return { year: "", month: "" };
	const [year, month] = value.split("-");
	return {
		year: /^\d{4}$/.test(year ?? "") ? year : "",
		month: /^(0[1-9]|1[0-2])$/.test(month ?? "") ? month : "",
	};
}

type ReportDatePickerButtonProps = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	className?: string;
};

function ReportDatePickerButton({ id, value, onChange, className }: ReportDatePickerButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const selectedDate = parseReportFilterDate(value);
	const displayValue = selectedDate ? formatFilterDateForDisplay(value) : "Select date";

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					className={className ?? "h-10 justify-between px-3 text-slate-500 hover:bg-white"}
				>
					<span>{displayValue}</span>
					<CalendarIcon className="h-4 w-4 text-slate-400" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={selectedDate}
					onSelect={(date) => {
						// `mode="single"` toggles: re-clicking the selected day reports undefined.
						// Report dates are required, so treat that as a no-op rather than clearing them.
						if (!date) return;
						onChange(formatDateToYYYYMMDD(date));
						setIsOpen(false);
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}

type ReportMonthFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

function ReportMonthField({ value, onChange }: ReportMonthFieldProps) {
	const { year, month } = parseMonthFilterValue(value);
	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 8 }, (_, index) => String(currentYear - index));

	const updateValue = (nextYear: string, nextMonth: string) => {
		onChange(`${nextYear || ""}-${nextMonth || ""}`);
	};

	return (
		<div className="flex flex-col gap-1.5">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<Select value={month} onValueChange={(nextMonth) => updateValue(year, nextMonth)}>
					<SelectTrigger className="h-10 text-slate-500">
						<SelectValue placeholder="Select month" />
					</SelectTrigger>
					<SelectContent>
						{MONTH_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={year} onValueChange={(nextYear) => updateValue(nextYear, month)}>
					<SelectTrigger className="h-10 text-slate-500">
						<SelectValue placeholder="Select year" />
					</SelectTrigger>
					<SelectContent>
						{yearOptions.map((option) => (
							<SelectItem key={option} value={option}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

type StaticReportSelectProps = {
	id: string;
	label: string;
	value?: "all" | "select";
	required?: boolean;
};

function StaticReportSelect({ id, label, value = "all", required }: StaticReportSelectProps) {
	return (
		<FilterRow label={label} required={required}>
			{/* ponytail: disabled because nothing reads this value yet; drop `disabled` once a query consumes it. */}
			<Select value={value} disabled>
				<SelectTrigger id={id} className="h-8 text-slate-500">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={value}>{value === "select" ? "Select" : "All"}</SelectItem>
				</SelectContent>
			</Select>
		</FilterRow>
	);
}

type CustomerSelectProps = {
	id: string;
	label: string;
	value: string;
	customers: Customer[];
	onChange: (customerId: string) => void;
};

function CustomerSelect({ id, label, value, customers, onChange }: CustomerSelectProps) {
	return (
		<FilterRow label={label}>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger id={id} className="h-8 text-slate-500" aria-label={label}>
					<SelectValue placeholder={`Select ${label.toLowerCase()}`} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All</SelectItem>
					{customers.map((customer) => (
						<SelectItem key={customer.id} value={customer.id}>
							{customer.code ? `${customer.code} : ${customer.name}` : customer.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FilterRow>
	);
}

type ProductSelectProps = {
	id: string;
	value: string;
	products: Product[];
	onChange: (productName: string) => void;
	disabled?: boolean;
};

function ProductSelect({ id, value, products, onChange, disabled }: ProductSelectProps) {
	return (
		<FilterRow label="Product">
			<Select value={value} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger id={id} className="h-8 text-slate-500" aria-label="Product">
					<SelectValue placeholder="Select product" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All</SelectItem>
					{products.map((product) => (
						<SelectItem key={product.id} value={product.name}>
							{product.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FilterRow>
	);
}

type EmployeeSelectProps = {
	id: string;
	value?: string;
	employees: Employee[];
	onChange: (employeeId: string) => void;
};

function EmployeeSelect({ id, value, employees, onChange }: EmployeeSelectProps) {
	return (
		<FilterRow label="Employee">
			{/* ponytail: disabled because no query reads filters.employeeId; drop `disabled` once one does. */}
			<Select value={value || "all"} onValueChange={onChange} disabled>
				<SelectTrigger id={id} className="h-8 text-slate-500" aria-label="Employee">
					<SelectValue placeholder="Select employee" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All</SelectItem>
					{employees.map((emp) => {
						const fullName = [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.username;
						return (
							<SelectItem key={emp.id} value={emp.id}>
								{fullName}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</FilterRow>
	);
}

type RabbitReportPeriodFieldProps = {
	fromDate: string;
	toDate: string;
	onFromDateChange: (value: string) => void;
	onToDateChange: (value: string) => void;
};

function RabbitReportPeriodField({ fromDate, toDate, onFromDateChange, onToDateChange }: RabbitReportPeriodFieldProps) {
	return (
		<FilterRow label="Report Period" required>
			<div className="flex h-10 items-stretch overflow-hidden rounded-md border border-slate-200 bg-white">
				<div className="flex w-10 shrink-0 items-center justify-center border-r border-slate-200 text-slate-400">
					<CalendarIcon className="h-4 w-4" />
				</div>
				<ReportDatePickerButton
					id="report-period-from"
					value={fromDate}
					onChange={onFromDateChange}
					className="h-10 flex-1 justify-start rounded-none border-0 px-3 text-slate-500 shadow-none hover:bg-white"
				/>
				<div className="flex items-center px-2 text-slate-400">-</div>
				<ReportDatePickerButton
					id="report-period-to"
					value={toDate}
					onChange={onToDateChange}
					className="h-10 flex-1 justify-start rounded-none border-0 px-3 text-slate-500 shadow-none hover:bg-white"
				/>
			</div>
		</FilterRow>
	);
}

function CustomerProfileCard({ customer }: { customer: Customer }) {
	const safeProfileUrl = getSafeAvatarImageUrl(customer.profileUrl);

	return (
		<div className="flex items-start gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
			<Avatar className="h-20 w-20 border-2 border-slate-100 shadow-sm">
				<AvatarImage src={safeProfileUrl} alt={customer.name} className="object-cover" />
				<AvatarFallback className="bg-slate-50 text-xl font-semibold text-slate-400">
					{customer.name.substring(0, 2).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className="flex flex-1 flex-col gap-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h3 className="text-xl font-bold text-slate-900">{customer.name}</h3>
						{customer.code && (
							<Badge
								variant="outline"
								className="border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700"
							>
								{customer.code}
							</Badge>
						)}
					</div>
					<Badge variant={customer.status ? "success" : "error"} className="capitalize">
						{customer.status ? "Active" : "Inactive"}
					</Badge>
				</div>

				<div className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
					{customer.telephone && (
						<div className="flex items-center gap-2">
							<span className="shrink-0 font-medium text-slate-400">Phone:</span>
							<span className="text-slate-700">{customer.telephone}</span>
						</div>
					)}
					{customer.email && (
						<div className="flex items-center gap-2">
							<span className="shrink-0 font-medium text-slate-400">Email:</span>
							<span className="truncate text-slate-700" title={customer.email}>
								{customer.email}
							</span>
						</div>
					)}
					{customer.address && (
						<div className="flex items-center gap-2">
							<span className="shrink-0 font-medium text-slate-400">Address:</span>
							<span className="truncate text-slate-700" title={customer.address}>
								{customer.address}
							</span>
						</div>
					)}
				</div>

				<div className="mt-2 flex flex-wrap gap-6 border-t border-slate-100 pt-3">
					{customer.depositBalance !== undefined && (
						<div className="flex flex-col">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deposit Balance</span>
							<span className="text-base font-bold text-emerald-600">
								{customer.depositBalance.toLocaleString(undefined, {
									style: "currency",
									currency: "USD",
								})}
							</span>
						</div>
					)}
					{customer.creditLimit !== undefined && (
						<div className="flex flex-col">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credit Limit</span>
							<span className="text-base font-bold text-amber-600">
								{customer.creditLimit.toLocaleString(undefined, {
									style: "currency",
									currency: "USD",
								})}
							</span>
						</div>
					)}
					{customer.invoiceCount !== undefined && (
						<div className="flex flex-col">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoices</span>
							<span className="text-base font-bold text-slate-700">{customer.invoiceCount}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

type OpenInvoiceFilterFormProps = {
	reportSlug: string;
	value: ReportFiltersValue;
	customers: Customer[];
	employees: Employee[];
	updateFilters: (nextValue: ReportFiltersValue) => void;
	onSubmit: (e?: React.BaseSyntheticEvent) => void;
};

function OpenInvoiceFilterForm({
	reportSlug,
	value,
	customers,
	employees,
	updateFilters,
	onSubmit,
}: OpenInvoiceFilterFormProps) {
	const isGrouped = reportSlug === "open-invoice-on-period-by-group";
	const { customerId, customerTypeId, employeeId, fromDate, toDate, showDetail } = value;
	const customersInType = getCustomersWithinType(customers, customerTypeId);

	return (
		<form className="grid gap-x-8 gap-y-2 xl:grid-cols-2" onSubmit={onSubmit}>
			<div className="flex flex-col gap-2">
				<StaticReportSelect id="report-branch" label="Branch" />
				<EmployeeSelect
					id="report-employee"
					value={employeeId}
					employees={employees}
					onChange={(nextEmployeeId) =>
						updateFilters({
							...value,
							employeeId: nextEmployeeId,
						})
					}
				/>
				<StaticReportSelect id="report-category" label="Category" />
				<StaticReportSelect id="report-term" label="Term" />
				<StaticReportSelect id="report-job" label={isGrouped ? "Group" : "Job"} />
			</div>

			<div className="flex flex-col gap-2">
				<StaticReportSelect id="report-geography" label="Geography" />
				<CustomerSelect
					id="report-customer-type"
					label="Customer Type"
					value={customerTypeId}
					customers={customers}
					onChange={(nextCustomerTypeId) => {
						// Customer Type limits Customer; changing the type invalidates
						// the previously picked customer, so reset it to All.
						updateFilters({
							...value,
							customerTypeId: nextCustomerTypeId,
							customerId: "all",
						});
					}}
				/>
				<CustomerSelect
					id="customer"
					label="Customer"
					value={customerId}
					customers={customersInType}
					onChange={(nextCustomerId) =>
						updateFilters({
							...value,
							customerId: nextCustomerId,
						})
					}
				/>
				<RabbitReportPeriodField
					fromDate={fromDate}
					toDate={toDate}
					onFromDateChange={(nextFromDate) =>
						updateFilters({
							...value,
							fromDate: nextFromDate,
							useDateRange: true,
						})
					}
					onToDateChange={(nextToDate) =>
						updateFilters({
							...value,
							toDate: nextToDate,
							useDateRange: true,
						})
					}
				/>
				<FilterRow label="Show Detail">
					<Checkbox
						id="report-show-detail"
						checked={showDetail ?? true}
						onCheckedChange={(checked) =>
							updateFilters({
								...value,
								showDetail: !!checked,
							})
						}
					/>
				</FilterRow>
				<FilterRow label="">
					<Button type="submit" className="h-8 w-fit bg-sky-500 px-4 hover:bg-sky-600">
						<Search className="mr-1.5 h-3.5 w-3.5" />
						Submit
					</Button>
				</FilterRow>
			</div>
		</form>
	);
}

type CustomerTransactionDetailByTypeFilterFormProps = {
	value: ReportFiltersValue;
	customers: Customer[];
	updateFilters: (nextValue: ReportFiltersValue) => void;
	onSubmit: (e?: React.BaseSyntheticEvent) => void;
};

function CustomerTransactionDetailByTypeFilterForm({
	value,
	customers,
	updateFilters,
	onSubmit,
}: CustomerTransactionDetailByTypeFilterFormProps) {
	const { customerId, customerTypeId, fromDate, toDate } = value;
	const customersInType = getCustomersWithinType(customers, customerTypeId);

	return (
		<form className="grid gap-x-8 gap-y-2 xl:grid-cols-2" onSubmit={onSubmit}>
			<div className="flex flex-col gap-2">
				<StaticReportSelect id="report-branch" label="Branch" />
				<StaticReportSelect id="report-geography" label="Geography" />
				<CustomerSelect
					id="report-customer-type"
					label="Customer Type"
					value={customerTypeId}
					customers={customers}
					onChange={(nextCustomerTypeId) => {
						updateFilters({
							...value,
							customerTypeId: nextCustomerTypeId,
							customerId: "all",
						});
					}}
				/>
				<CustomerSelect
					id="customer"
					label="Customer"
					value={customerId}
					customers={customersInType}
					onChange={(nextCustomerId) =>
						updateFilters({
							...value,
							customerId: nextCustomerId,
						})
					}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<StaticReportSelect id="report-category" label="Category" />
				<StaticReportSelect id="report-item" label="Item" />
				<RabbitReportPeriodField
					fromDate={fromDate}
					toDate={toDate}
					onFromDateChange={(nextFromDate) =>
						updateFilters({
							...value,
							fromDate: nextFromDate,
							useDateRange: true,
						})
					}
					onToDateChange={(nextToDate) =>
						updateFilters({
							...value,
							toDate: nextToDate,
							useDateRange: true,
						})
					}
				/>
				<FilterRow label="">
					<Button type="submit" className="h-8 w-fit bg-sky-500 px-4 hover:bg-sky-600">
						<Search className="mr-1.5 h-3.5 w-3.5" />
						Submit
					</Button>
				</FilterRow>
			</div>
		</form>
	);
}

type CashTransactionFilterFormProps = {
	value: ReportFiltersValue;
	updateFilters: (nextValue: ReportFiltersValue) => void;
	onSubmit: (e?: React.BaseSyntheticEvent) => void;
};

function CashTransactionFilterForm({ value, updateFilters, onSubmit }: CashTransactionFilterFormProps) {
	const { fromDate, toDate } = value;

	return (
		<form className="flex flex-col gap-3" onSubmit={onSubmit}>
			<div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<FilterRow label="Journal type">
						{/* ponytail: disabled because no query reads it; drop `disabled` once one does. */}
						<Select defaultValue="all" disabled>
							<SelectTrigger id="cash-journal-type" className="h-8 text-slate-500">
								<SelectValue placeholder="- All -" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">- All -</SelectItem>
								<SelectItem value="receipt">Receipt</SelectItem>
								<SelectItem value="expense">Expense</SelectItem>
								<SelectItem value="cash-sale">Cash Sale</SelectItem>
							</SelectContent>
						</Select>
					</FilterRow>

					<FilterRow label="Chart of account">
						{/* ponytail: disabled because no query reads it; drop `disabled` once one does. */}
						<div className="grid grid-cols-2 gap-2">
							<Select defaultValue="all" disabled>
								<SelectTrigger id="cash-chart-of-account-1" className="h-8 text-slate-500">
									<SelectValue placeholder="- All -" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">- All -</SelectItem>
									<SelectItem value="10110">10110 : Cash on hand</SelectItem>
								</SelectContent>
							</Select>
							<Select defaultValue="all" disabled>
								<SelectTrigger id="cash-chart-of-account-2" className="h-8 text-slate-500">
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="active">Active</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</FilterRow>
				</div>

				<div className="flex flex-col justify-between gap-2">
					<RabbitReportPeriodField
						fromDate={fromDate}
						toDate={toDate}
						onFromDateChange={(nextFromDate) =>
							updateFilters({
								...value,
								fromDate: nextFromDate,
								useDateRange: true,
							})
						}
						onToDateChange={(nextToDate) =>
							updateFilters({
								...value,
								toDate: nextToDate,
								useDateRange: true,
							})
						}
					/>

					<div className="flex items-center justify-start">
						<Button type="submit" className="h-8 w-fit bg-sky-500 px-5 hover:bg-sky-600">
							<Search className="mr-1.5 h-3.5 w-3.5" />
							Submit
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}

export const ReportFilters = memo(function ReportFilters({
	value: appliedValue,
	onSubmit,
	filterConfig,
	reportSlug,
}: ReportFiltersProps) {
	const { control, handleSubmit, reset, setValue } = useForm<ReportFiltersValue>({
		defaultValues: appliedValue,
	});
	const value = useWatch({ control }) as ReportFiltersValue;
	const updateFilters = (nextValue: ReportFiltersValue) => {
		(Object.keys(nextValue) as Array<keyof ReportFiltersValue>).forEach((key) => {
			setValue(key, nextValue[key], { shouldDirty: true });
		});
	};
	useEffect(() => reset(appliedValue), [appliedValue, reset]);
	const submit = handleSubmit((nextValue) => onSubmit(nextValue));
	const { customerId, productName, fromDate, toDate } = value;
	const { data: customers = [] } = useQuery({
		queryKey: CUSTOMER_QUERY_KEYS.list({ all: true }),
		queryFn: () => fetchAllCustomers(),
		enabled: filterConfig.customer || !!filterConfig.customerType,
	});
	const { data: products = [] } = useQuery({
		queryKey: PRODUCT_QUERY_KEYS.list(),
		queryFn: productService.getProductList,
	});
	const { data: employees = [] } = useQuery({
		queryKey: EMPLOYEE_QUERY_KEYS.list(),
		queryFn: employeeService.getEmployeeList,
	});
	const isSaleDetail = reportSlug === "sale-detail-by-customer" || reportSlug === "receipt-detail-by-customer";
	const isOpenInvoiceReport =
		reportSlug === "open-invoice-detail-by-customer" || reportSlug === "open-invoice-on-period-by-group";
	const isCashTransactionReport = reportSlug === "cash-transaction-report";
	const isCustomerTransactionDetailByType = reportSlug === "customer-transaction-detail-by-type";
	const selectedCustomer = isSaleDetail ? (customers.find((c: Customer) => c.id === customerId) ?? null) : null;

	if (isOpenInvoiceReport) {
		return (
			<OpenInvoiceFilterForm
				reportSlug={reportSlug}
				value={value}
				customers={customers}
				employees={employees}
				updateFilters={updateFilters}
				onSubmit={submit}
			/>
		);
	}

	if (isCustomerTransactionDetailByType) {
		return (
			<CustomerTransactionDetailByTypeFilterForm
				value={value}
				customers={customers}
				updateFilters={updateFilters}
				onSubmit={submit}
			/>
		);
	}

	if (isCashTransactionReport) {
		return <CashTransactionFilterForm value={value} updateFilters={updateFilters} onSubmit={submit} />;
	}

	if (isSaleDetail) {
		return (
			<form className="flex flex-col gap-6" onSubmit={submit}>
				{selectedCustomer && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-300">
						<CustomerProfileCard customer={selectedCustomer} />
					</div>
				)}
				<div className="grid grid-cols-1 gap-x-8 gap-y-4 xl:grid-cols-2">
					<div className="flex flex-col gap-4">
						<StaticReportSelect id="report-branch" label="Branch" />
						<StaticReportSelect id="report-warehouse" label="Warehouse" />
						<EmployeeSelect
							id="report-employee-sale"
							value={value.employeeId}
							employees={employees}
							onChange={(nextEmployeeId) => updateFilters({ ...value, employeeId: nextEmployeeId })}
						/>
						<StaticReportSelect id="report-geography" label="Geography" />
						{filterConfig.customerType && (
							<CustomerSelect
								id="customer-type-sale"
								label="Customer Type"
								value={value.customerTypeId}
								customers={customers}
								onChange={(nextCustomerTypeId) => {
									updateFilters({
										...value,
										customerTypeId: nextCustomerTypeId,
										customerId: "all",
									});
								}}
							/>
						)}
						<StaticReportSelect id="report-location" label="Location" />
						<CustomerSelect
							id="customer-sale"
							label="Customer"
							value={customerId}
							customers={getCustomersWithinType(customers, value.customerTypeId)}
							onChange={(nextCustomerId) => updateFilters({ ...value, customerId: nextCustomerId })}
						/>
					</div>

					<div className="flex flex-col gap-4">
						<StaticReportSelect id="report-type" label="Type" />
						<StaticReportSelect id="report-category" label="Category" />
						<StaticReportSelect id="report-class" label="Class" value="select" />
						<StaticReportSelect id="report-brand" label="Brand" />
						<StaticReportSelect id="report-item-category" label="Item Category" />
						<StaticReportSelect id="report-group" label="Group" />
						<StaticReportSelect id="report-rank" label="Rank" />
						<ProductSelect
							id="report-product-sale"
							value={productName}
							products={products}
							onChange={(nextProductName) => updateFilters({ ...value, productName: nextProductName })}
							disabled={reportSlug === "receipt-detail-by-customer"}
						/>

						<FilterRow label="Promotion">
							<div className="flex flex-wrap gap-4">
								<Label
									htmlFor="report-promotion-chargeable"
									className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-700"
								>
									<Checkbox id="report-promotion-chargeable" disabled />
									Chargeable
								</Label>
								<Label
									htmlFor="report-promotion-free-item"
									className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-700"
								>
									<Checkbox id="report-promotion-free-item" disabled />
									Free Item
								</Label>
							</div>
						</FilterRow>

						<FilterRow label="Item Summary">
							<Checkbox aria-label="Item Summary" disabled />
						</FilterRow>

						<RabbitReportPeriodField
							fromDate={fromDate}
							toDate={toDate}
							onFromDateChange={(nextFromDate) =>
								updateFilters({
									...value,
									fromDate: nextFromDate,
									useDateRange: true,
								})
							}
							onToDateChange={(nextToDate) =>
								updateFilters({
									...value,
									toDate: nextToDate,
									useDateRange: true,
								})
							}
						/>

						<FilterRow label="">
							<Button type="submit" className="h-9 w-fit bg-sky-500 px-5 hover:bg-sky-600">
								<Search className="mr-2 h-4 w-4" />
								Submit
							</Button>
						</FilterRow>
					</div>
				</div>
			</form>
		);
	}

	return (
		<form className="flex flex-col gap-6" onSubmit={submit}>
			<div className="grid grid-cols-1 gap-x-8 gap-y-4 xl:grid-cols-2">
				<div className="flex flex-col gap-4">
					<StaticReportSelect id="report-branch" label="Branch" />
					<StaticReportSelect id="report-warehouse" label="Warehouse" />
					<EmployeeSelect
						id="report-employee"
						value={value.employeeId}
						employees={employees}
						onChange={(nextEmployeeId) => updateFilters({ ...value, employeeId: nextEmployeeId })}
					/>
					<StaticReportSelect id="report-geography" label="Geography" />
					{filterConfig.customerType && (
						<CustomerSelect
							id="customer-type"
							label="Customer Type"
							value={value.customerTypeId}
							customers={customers}
							onChange={(nextCustomerTypeId) => {
								updateFilters({
									...value,
									customerTypeId: nextCustomerTypeId,
									customerId: "all",
								});
							}}
						/>
					)}
					<StaticReportSelect id="report-location" label="Location" />
					{filterConfig.customer && (
						<CustomerSelect
							id="customer"
							label="Customer"
							value={customerId}
							customers={getCustomersWithinType(customers, value.customerTypeId)}
							onChange={(nextCustomerId) => updateFilters({ ...value, customerId: nextCustomerId })}
						/>
					)}
				</div>

				<div className="flex flex-col gap-4">
					<StaticReportSelect id="report-type" label="Type" />
					<StaticReportSelect id="report-category" label="Category" />
					<StaticReportSelect id="report-class" label="Class" value="select" />
					<StaticReportSelect id="report-brand" label="Brand" />
					<StaticReportSelect id="report-item-category" label="Item Category" />
					<StaticReportSelect id="report-group" label="Group" />
					<StaticReportSelect id="report-rank" label="Rank" />
					{/* ponytail: productName only reaches listInvoiceDetails, which no report in this branch uses. */}
					<ProductSelect
						id="report-product"
						value={productName}
						products={products}
						onChange={(nextProductName) => updateFilters({ ...value, productName: nextProductName })}
						disabled
					/>

					<FilterRow label="Promotion">
						<div className="flex flex-wrap gap-4">
							<Label
								htmlFor="report-promotion-chargeable"
								className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-700"
							>
								<Checkbox id="report-promotion-chargeable" disabled />
								Chargeable
							</Label>
							<Label
								htmlFor="report-promotion-free-item"
								className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-700"
							>
								<Checkbox id="report-promotion-free-item" disabled />
								Free Item
							</Label>
						</div>
					</FilterRow>

					<FilterRow label="Item Summary">
						<Checkbox aria-label="Item Summary" disabled />
					</FilterRow>

					{filterConfig.dateRange && (
						<RabbitReportPeriodField
							fromDate={fromDate}
							toDate={toDate}
							onFromDateChange={(nextFromDate) =>
								updateFilters({
									...value,
									fromDate: nextFromDate,
									useDateRange: true,
								})
							}
							onToDateChange={(nextToDate) =>
								updateFilters({
									...value,
									toDate: nextToDate,
									useDateRange: true,
								})
							}
						/>
					)}

					{filterConfig.singleDate && (
						<FilterRow label="Date" required>
							<ReportDatePickerButton
								id="report-date"
								value={fromDate}
								onChange={(nextDate) =>
									updateFilters({
										...value,
										fromDate: nextDate,
										toDate: nextDate,
										useDateRange: true,
									})
								}
							/>
						</FilterRow>
					)}

					{filterConfig.monthOnly && (
						<FilterRow label="Month - Year" required>
							<ReportMonthField
								value={fromDate}
								onChange={(nextMonth) =>
									updateFilters({
										...value,
										fromDate: nextMonth,
										toDate: nextMonth,
										useDateRange: true,
									})
								}
							/>
						</FilterRow>
					)}

					<FilterRow label="">
						<Button type="submit" className="h-9 w-fit bg-sky-500 px-5 hover:bg-sky-600">
							<Search className="mr-2 h-4 w-4" />
							Submit
						</Button>
					</FilterRow>
				</div>
			</div>

			{/* <FilterRow label="">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={
              hasPendingChanges
                ? "rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700"
                : "text-sm text-slate-500"
            }
          >
            {hasPendingChanges
              ? "Filter changes are not applied yet."
              : "Displayed data matches the current filters."}
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-6"
              onClick={() => reset(appliedValue)}
              disabled={!hasPendingChanges}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="h-10 bg-sky-500 px-9 hover:bg-sky-600"
              disabled={!hasPendingChanges}
            >
              Submit
            </Button>
          </div>
        </div>
      </FilterRow> */}
		</form>
	);
});
