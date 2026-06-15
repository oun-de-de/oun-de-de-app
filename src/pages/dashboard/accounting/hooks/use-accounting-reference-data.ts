import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import accountingService from "@/core/api/services/accounting-service";
import customerService from "@/core/api/services/customer-service";
import employeeService from "@/core/api/services/employee-service";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";
import { EMPLOYEE_QUERY_KEYS } from "@/core/query-keys/employee-query-keys";
import type { SelectOption } from "@/core/types/common";
import type {
	AccountTypeResult,
	ChartOfAccountResult,
	JournalClassResult,
	JournalTypeResult,
} from "@/core/types/accounting";
import type { Customer } from "@/core/types/customer";
import type { Employee } from "@/core/types/employee";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";
import { ACCOUNTING_QUERY_KEYS, ACCOUNTING_REFERENCE_PAGE_SIZE } from "../constants";
import { formatChartAccountLabel } from "../utils/map-chart-account-result";

type AccountingReferenceDataOptions = {
	accountTypesEnabled?: boolean;
	journalTypesEnabled?: boolean;
	journalClassesEnabled?: boolean;
	employeesEnabled?: boolean;
	customersEnabled?: boolean;
	chartAccountsEnabled?: boolean;
	loadChartAccountType?: boolean;
};

function mapAccountTypeOptions(accountTypes: AccountTypeResult[]): SelectOption[] {
	return accountTypes.map((item) => ({
		value: item.id,
		label: item.code + " : " + item.name,
	}));
}

function mapChartAccountOptions(chartAccounts: ChartOfAccountResult[]): SelectOption[] {
	return chartAccounts.map((item) => ({
		value: item.id,
		label: formatChartAccountLabel(item),
	}));
}

function mapJournalTypeOptions(journalTypes: JournalTypeResult[]): SelectOption[] {
	return journalTypes.map((item) => ({
		value: item.id,
		label: item.name,
	}));
}

function mapJournalClassOptions(journalClasses: JournalClassResult[]): SelectOption[] {
	return journalClasses.map((item) => ({
		value: item.id,
		label: item.name,
	}));
}

function mapEmployeeOptions(employees: Employee[]): SelectOption[] {
	return employees.map((item) => ({
		value: item.id,
		label: getEmployeeDisplayName(item),
	}));
}

function mapCustomerOptions(customers: Customer[]): SelectOption[] {
	return customers.map((item) => ({
		value: item.id,
		label: `${item.code} : ${item.name}`,
	}));
}

export function useAccountingReferenceData(options?: AccountingReferenceDataOptions) {
	const customerListParams = {
		page: 1,
		limit: ACCOUNTING_REFERENCE_PAGE_SIZE,
		sort: "code,asc",
	};

	const { data: accountTypes = [], isLoading: isLoadingAccountTypes } = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.referenceAccountTypes,
		queryFn: () => accountingService.listAccountTypes(),
		enabled: options?.accountTypesEnabled ?? true,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const { data: journalTypes = [], isLoading: isLoadingJournalTypes } = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.referenceJournalTypes,
		queryFn: () => accountingService.listJournalTypes(),
		enabled: options?.journalTypesEnabled ?? true,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const { data: journalClasses = [], isLoading: isLoadingJournalClasses } = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.referenceJournalClasses,
		queryFn: () => accountingService.listJournalClasses(),
		enabled: options?.journalClassesEnabled ?? true,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
		queryKey: EMPLOYEE_QUERY_KEYS.list(),
		queryFn: () => employeeService.getEmployeeList(),
		enabled: options?.employeesEnabled ?? true,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const { data: customersPagination, isLoading: isLoadingCustomers } = useQuery({
		queryKey: CUSTOMER_QUERY_KEYS.list(customerListParams),
		queryFn: () => customerService.getCustomerList(customerListParams),
		enabled: options?.customersEnabled ?? true,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const { data: chartAccountsPagination, isLoading: isLoadingChartAccounts } = useQuery({
		queryKey: [...ACCOUNTING_QUERY_KEYS.referenceChartAccounts, Boolean(options?.loadChartAccountType)],
		queryFn: () =>
			accountingService.listChartOfAccounts({
				page: 1,
				limit: ACCOUNTING_REFERENCE_PAGE_SIZE,
				loadAccountType: options?.loadChartAccountType,
				sort: "code,asc",
			}),
		enabled: options?.chartAccountsEnabled ?? true,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const chartAccounts = chartAccountsPagination?.list ?? [];
	const customers = customersPagination?.list ?? [];

	return {
		accountTypes,
		chartAccounts,
		customers,
		journalTypes,
		journalClasses,
		employees,
		accountTypeOptions: useMemo(() => mapAccountTypeOptions(accountTypes), [accountTypes]),
		chartAccountOptions: useMemo(() => mapChartAccountOptions(chartAccounts), [chartAccounts]),
		customerOptions: useMemo(() => mapCustomerOptions(customers), [customers]),
		journalTypeOptions: useMemo(() => mapJournalTypeOptions(journalTypes), [journalTypes]),
		journalClassOptions: useMemo(() => mapJournalClassOptions(journalClasses), [journalClasses]),
		employeeOptions: useMemo(() => mapEmployeeOptions(employees), [employees]),
		isLoading:
			isLoadingAccountTypes ||
			isLoadingChartAccounts ||
			isLoadingCustomers ||
			isLoadingJournalTypes ||
			isLoadingJournalClasses ||
			isLoadingEmployees,
	};
}
