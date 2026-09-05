import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { memo, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import employeeService from "@/core/api/services/employee-service";
import productService from "@/core/api/services/product-service";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";
import { EMPLOYEE_QUERY_KEYS } from "@/core/query-keys/employee-query-keys";
import { PRODUCT_QUERY_KEYS } from "@/core/query-keys/product-query-keys";
import type { Customer } from "@/core/types/customer";
import type { Employee } from "@/core/types/employee";
import type { Product } from "@/core/types/product";
import { Button } from "@/core/ui/button";
import { Checkbox } from "@/core/ui/checkbox";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import type { ReportFiltersProps, ReportFiltersValue } from "./report-filter-types";

export type { ReportFiltersValue } from "./report-filter-types";
export { getSafeAvatarImageUrl, CustomerProfileCard } from "./report-filter-profile";
export { FilterRow, ReportSearchCombobox, type ReportComboboxOption } from "./report-search-combobox";
export {
	MONTH_OPTIONS,
	ReportDatePickerButton,
	ReportMonthField,
	RabbitReportPeriodField,
} from "./report-date-fields";

import {
	fetchAllCustomers,
	getCustomersWithinType,
	toCustomerComboboxOptions,
	toEmployeeComboboxOptions,
} from "./report-data-utils";
import { FilterRow, ReportSearchCombobox, type ReportComboboxOption } from "./report-search-combobox";
import { ReportDatePickerButton, ReportMonthField, RabbitReportPeriodField } from "./report-date-fields";
import { CustomerProfileCard } from "./report-filter-profile";

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

type OpenInvoiceFilterFormProps = {
	reportSlug: string;
	value: ReportFiltersValue;
	customers: Customer[];
	employees: Employee[];
	updateFilters: (nextValue: ReportFiltersValue) => void;
	onSubmit: (e?: React.BaseSyntheticEvent) => void;
};

const OPEN_INVOICE_BRANCH_OPTIONS: ReportComboboxOption[] = [
	{ value: "01", label: "01 : ភ្នំពេញ" },
	{ value: "all", label: "All" },
];

const OPEN_INVOICE_CATEGORY_OPTIONS: ReportComboboxOption[] = [{ value: "all", label: "All" }];

const OPEN_INVOICE_TERM_OPTIONS: ReportComboboxOption[] = [{ value: "all", label: "All" }];

const OPEN_INVOICE_JOB_OPTIONS: ReportComboboxOption[] = [{ value: "all", label: "Please Select" }];

const OPEN_INVOICE_GROUP_OPTIONS: ReportComboboxOption[] = [{ value: "all", label: "All" }];

const OPEN_INVOICE_GEOGRAPHY_OPTIONS: ReportComboboxOption[] = [{ value: "all", label: "All" }];

function OpenInvoiceFilterForm({
	reportSlug,
	value,
	customers,
	employees,
	updateFilters,
	onSubmit,
}: OpenInvoiceFilterFormProps) {
	const isGrouped = reportSlug === "open-invoice-on-period-by-group";
	const {
		customerId,
		customerTypeId,
		employeeId,
		fromDate,
		toDate,
		showDetail,
		branchId,
		geography,
		category,
		term,
		job,
	} = value;
	const customersInType = getCustomersWithinType(customers, customerTypeId);

	const employeeOptions = useMemo<ReportComboboxOption[]>(() => toEmployeeComboboxOptions(employees), [employees]);

	const customerTypeOptions = useMemo<ReportComboboxOption[]>(() => toCustomerComboboxOptions(customers), [customers]);

	const customerOptions = useMemo<ReportComboboxOption[]>(
		() => toCustomerComboboxOptions(customersInType),
		[customersInType],
	);

	const selectedBranch = branchId ?? "01";

	return (
		<form className="grid gap-x-8 gap-y-2 xl:grid-cols-2" onSubmit={onSubmit}>
			<div className="flex flex-col gap-2">
				<ReportSearchCombobox
					id="report-branch"
					label="Branch"
					required
					value={selectedBranch}
					options={OPEN_INVOICE_BRANCH_OPTIONS}
					onChange={(nextBranchId) =>
						updateFilters({
							...value,
							branchId: nextBranchId,
						})
					}
				/>
				<ReportSearchCombobox
					id="report-employee"
					label="Employee"
					value={employeeId || "all"}
					options={employeeOptions}
					onChange={(nextEmployeeId) =>
						updateFilters({
							...value,
							employeeId: nextEmployeeId,
						})
					}
				/>
				<ReportSearchCombobox
					id="report-category"
					label="Category"
					value={category || "all"}
					options={OPEN_INVOICE_CATEGORY_OPTIONS}
					onChange={(nextCategory) =>
						updateFilters({
							...value,
							category: nextCategory,
						})
					}
				/>
				<ReportSearchCombobox
					id="report-term"
					label="Term"
					value={term || "all"}
					options={OPEN_INVOICE_TERM_OPTIONS}
					onChange={(nextTerm) =>
						updateFilters({
							...value,
							term: nextTerm,
						})
					}
				/>
				<ReportSearchCombobox
					id="report-job"
					label={isGrouped ? "Group" : "Job"}
					value={job || "all"}
					options={isGrouped ? OPEN_INVOICE_GROUP_OPTIONS : OPEN_INVOICE_JOB_OPTIONS}
					onChange={(nextJob) =>
						updateFilters({
							...value,
							job: nextJob,
						})
					}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<ReportSearchCombobox
					id="report-geography"
					label="Geography"
					value={geography || "all"}
					options={OPEN_INVOICE_GEOGRAPHY_OPTIONS}
					onChange={(nextGeography) =>
						updateFilters({
							...value,
							geography: nextGeography,
						})
					}
				/>
				<ReportSearchCombobox
					id="report-customer-type"
					label="Customer Type"
					value={customerTypeId || "all"}
					options={customerTypeOptions}
					onChange={(nextCustomerTypeId) => {
						updateFilters({
							...value,
							customerTypeId: nextCustomerTypeId,
							customerId: "all",
						});
					}}
				/>
				<ReportSearchCombobox
					id="customer"
					label="Customer"
					value={customerId || "all"}
					options={customerOptions}
					onChange={(nextCustomerId) =>
						updateFilters({
							...value,
							customerId: nextCustomerId,
						})
					}
				/>
				{!isGrouped ? (
					<FilterRow label="Report Date" required>
						<ReportDatePickerButton
							id="report-date"
							value={fromDate || toDate}
							onChange={(nextDate) =>
								updateFilters({
									...value,
									fromDate: nextDate,
									toDate: nextDate,
									useDateRange: false,
								})
							}
						/>
					</FilterRow>
				) : (
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
