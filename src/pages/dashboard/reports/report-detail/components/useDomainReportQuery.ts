import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import inventoryService from "@/core/api/services/inventory-service";
import productService from "@/core/api/services/product-service";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";
import { PRODUCT_QUERY_KEYS } from "@/core/query-keys/product-query-keys";
import type { ReportDefinition } from "../report-types";
import { fetchAllCustomers, fetchAllLoans, matchesCustomerType, normalizeCustomerText } from "./report-data-utils";
import type { ReportFiltersValue } from "./report-filters";
import { combineQueryStates } from "./report-query-utils";
import { normalizeReportFilters } from "./report-table-utils";

interface UseDomainReportQueryParams {
	definition: ReportDefinition;
	filters?: ReportFiltersValue;
	isCustomerList: boolean;
	isProductList: boolean;
	isAssetList: boolean;
	isLoanList: boolean;
	customerId?: string;
	customerTypeId?: string;
}

export function useDomainReportQuery({
	definition,
	filters,
	isCustomerList,
	isProductList,
	isAssetList,
	isLoanList,
	customerId,
	customerTypeId,
}: UseDomainReportQueryParams) {
	const { reportDateFrom, reportDateTo } = normalizeReportFilters(filters);

	const customerQuery = useQuery({
		queryKey: CUSTOMER_QUERY_KEYS.list({ all: true }),
		queryFn: () => fetchAllCustomers(),
		enabled:
			isCustomerList ||
			(isLoanList && definition.loanBorrowerType === "customer") ||
			Boolean((definition.filterConfig?.customer && customerId) || definition.filterConfig?.customerType),
	});

	const productQuery = useQuery({
		queryKey: PRODUCT_QUERY_KEYS.list(),
		queryFn: () => productService.getProductList(),
		enabled: isProductList,
	});

	const inventoryItemsQuery = useQuery({
		queryKey: ["report", "inventory-items"],
		queryFn: () => inventoryService.getItems({}),
		enabled: isAssetList,
	});

	const loanQuery = useQuery({
		queryKey: [
			"report",
			"loan-list",
			definition.loanBorrowerType ?? "customer",
			customerId ?? "all",
			reportDateFrom ?? "",
			reportDateTo ?? "",
		],
		queryFn: () =>
			fetchAllLoans({
				borrower_type: definition.loanBorrowerType,
				borrower_id: definition.loanBorrowerType === "customer" ? customerId : undefined,
				from: reportDateFrom,
				to: reportDateTo,
				sort: "createAt,desc",
			}),
		enabled: isLoanList,
	});

	const queryState = combineQueryStates(customerQuery, productQuery, inventoryItemsQuery, loanQuery);

	const customers = queryState.isError ? [] : (customerQuery.data ?? []);

	const isCustomerTypeAll = !customerTypeId || normalizeCustomerText(customerTypeId) === "all";

	const selectedCustomerType = useMemo(
		() => (!isCustomerTypeAll ? customers.find((customer) => customer.id === customerTypeId) : undefined),
		[customerTypeId, customers, isCustomerTypeAll],
	);
	const customerTypeCustomers = useMemo(
		() =>
			!isCustomerTypeAll ? customers.filter((customer) => matchesCustomerType(customer, selectedCustomerType)) : [],
		[customers, isCustomerTypeAll, selectedCustomerType],
	);
	const customerTypeCustomerNames = useMemo(
		() =>
			new Set<string>(
				customerTypeCustomers
					.map((customer) => normalizeCustomerText(customer.name))
					.filter((name): name is string => Boolean(name)),
			),
		[customerTypeCustomers],
	);
	// Customer and Customer Type compose with AND: picking both narrows to that one customer,
	// and only if it actually belongs to the selected type.
	const filteredCustomers = useMemo(() => {
		const byType = !isCustomerTypeAll ? customerTypeCustomers : customers;
		return customerId ? byType.filter((customer) => customer.id === customerId) : byType;
	}, [customerId, customerTypeCustomers, customers, isCustomerTypeAll]);

	const loanContent = queryState.isError ? [] : (loanQuery.data ?? []);

	const installmentsByLoanId = useMemo(
		() =>
			loanContent.reduce<Record<string, []>>((acc, loan) => {
				acc[loan.id] = [];
				return acc;
			}, {}),
		[loanContent],
	);

	return {
		customers,
		filteredCustomers,
		customerTypeCustomers,
		customerTypeCustomerNames,
		products: queryState.isError ? [] : (productQuery.data ?? []),
		inventoryItems: queryState.isError ? undefined : inventoryItemsQuery.data,
		loanContent,
		installmentsByLoanId: loanQuery.data && !queryState.isError ? installmentsByLoanId : {},
		isLoading: queryState.isLoading,
		isError: queryState.isError,
		refetch: queryState.refetch,
	};
}
