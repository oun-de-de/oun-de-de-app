import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import accountingService from "@/core/api/services/accounting-service";
import employeeService from "@/core/api/services/employee-service";
import type { SelectOption } from "@/core/types/common";
import type {
	AccountTypeResult,
	ChartOfAccountResult,
	JournalClassResult,
	JournalTypeResult,
} from "@/core/types/accounting";
import type { Employee } from "@/core/types/employee";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";
import { ACCOUNTING_QUERY_KEYS, ACCOUNTING_REFERENCE_PAGE_SIZE } from "../constants";
import { formatChartAccountLabel } from "../utils/map-chart-account-result";

function mapAccountTypeOptions(accountTypes: AccountTypeResult[]): SelectOption[] {
	return accountTypes.map((item) => ({
		value: item.id,
		label: item.name,
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

export function useAccountingReferenceData() {
	const { data: accountTypes = [], isLoading: isLoadingAccountTypes } = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.referenceAccountTypes,
		queryFn: () => accountingService.listAccountTypes(),
	});

	const { data: journalTypes = [], isLoading: isLoadingJournalTypes } = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.referenceJournalTypes,
		queryFn: () => accountingService.listJournalTypes(),
	});

	const { data: journalClasses = [], isLoading: isLoadingJournalClasses } = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.referenceJournalClasses,
		queryFn: () => accountingService.listJournalClasses(),
	});

	const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.referenceEmployees,
		queryFn: () => employeeService.getEmployeeList(),
	});

	const { data: chartAccountsPagination, isLoading: isLoadingChartAccounts } = useQuery({
		queryKey: ACCOUNTING_QUERY_KEYS.referenceChartAccounts,
		queryFn: () =>
			accountingService.listChartOfAccounts({
				page: 1,
				limit: ACCOUNTING_REFERENCE_PAGE_SIZE,
				sort: "code,asc",
			}),
	});

	const chartAccounts = chartAccountsPagination?.list ?? [];

	return {
		accountTypes,
		chartAccounts,
		journalTypes,
		journalClasses,
		employees,
		accountTypeOptions: useMemo(() => mapAccountTypeOptions(accountTypes), [accountTypes]),
		chartAccountOptions: useMemo(() => mapChartAccountOptions(chartAccounts), [chartAccounts]),
		journalTypeOptions: useMemo(() => mapJournalTypeOptions(journalTypes), [journalTypes]),
		journalClassOptions: useMemo(() => mapJournalClassOptions(journalClasses), [journalClasses]),
		employeeOptions: useMemo(() => mapEmployeeOptions(employees), [employees]),
		isLoading:
			isLoadingAccountTypes ||
			isLoadingChartAccounts ||
			isLoadingJournalTypes ||
			isLoadingJournalClasses ||
			isLoadingEmployees,
	};
}
