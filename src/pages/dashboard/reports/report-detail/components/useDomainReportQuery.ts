import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import customerService from "@/core/api/services/customer-service";
import cycleService from "@/core/api/services/cycle-service";
import inventoryService from "@/core/api/services/inventory-service";
import loanService from "@/core/api/services/loan-service";
import productService from "@/core/api/services/product-service";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";
import { PRODUCT_QUERY_KEYS } from "@/core/query-keys/product-query-keys";
import type { ReportDefinition } from "../report-types";
import { matchesCustomerType, normalizeCustomerText } from "./report-data-utils";
import type { ReportFiltersValue } from "./report-filters";
import { normalizeReportFilters } from "./report-table-utils";

interface UseDomainReportQueryParams {
	definition: ReportDefinition;
	filters?: ReportFiltersValue;
	hasRequiredDateFilters: boolean;
	isCustomerList: boolean;
	isProductList: boolean;
	isAssetList: boolean;
	isLoanList: boolean;
	isCycle: boolean;
	customerId?: string;
	customerTypeId?: string;
}

export function useDomainReportQuery({
	definition,
	filters,
	hasRequiredDateFilters,
	isCustomerList,
	isProductList,
	isAssetList,
	isLoanList,
	isCycle,
	customerId,
	customerTypeId,
}: UseDomainReportQueryParams) {
	const { reportDateFrom, reportDateTo } = normalizeReportFilters(filters);
	const customerListParams = { limit: 10000 };

	const customerQuery = useQuery({
		queryKey: CUSTOMER_QUERY_KEYS.list(customerListParams),
		queryFn: () => customerService.getCustomerList(customerListParams),
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
			loanService.getLoans({
				borrower_type: definition.loanBorrowerType,
				borrower_id: definition.loanBorrowerType === "customer" ? customerId : undefined,
				from: reportDateFrom,
				to: reportDateTo,
				page: 1,
				size: 10000,
				sort: "createAt,desc",
			}),
		enabled: isLoanList,
	});

	const cycleQuery = useQuery({
		queryKey: ["report", "cycle-list", customerId ?? "all", reportDateFrom ?? "", reportDateTo ?? ""],
		queryFn: () =>
			cycleService.getCycles({
				page: 1,
				size: 10000,
				sort: "startDate,desc",
				customerId,
				from: reportDateFrom,
				to: reportDateTo,
			}),
		enabled: isCycle && hasRequiredDateFilters,
	});

	const customers = customerQuery.data?.list ?? [];
	const selectedCustomerType = useMemo(
		() => (customerTypeId ? customers.find((customer) => customer.id === customerTypeId) : undefined),
		[customerTypeId, customers],
	);
	const customerTypeCustomers = useMemo(
		() => (customerTypeId ? customers.filter((customer) => matchesCustomerType(customer, selectedCustomerType)) : []),
		[customerTypeId, customers, selectedCustomerType],
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
		const byType = customerTypeId ? customerTypeCustomers : customers;
		return customerId ? byType.filter((customer) => customer.id === customerId) : byType;
	}, [customerId, customerTypeCustomers, customerTypeId, customers]);

	const installmentsByLoanId = useMemo(
		() =>
			(loanQuery.data?.content ?? []).reduce<Record<string, []>>((acc, loan) => {
				acc[loan.id] = [];
				return acc;
			}, {}),
		[loanQuery.data?.content],
	);

	return {
		customers,
		filteredCustomers,
		customerTypeCustomers,
		customerTypeCustomerNames,
		products: productQuery.data ?? [],
		inventoryItems: inventoryItemsQuery.data,
		loanContent: loanQuery.data?.content ?? [],
		installmentsByLoanId: loanQuery.data ? installmentsByLoanId : {},
		cycles: cycleQuery.data?.list ?? [],
		isLoading:
			customerQuery.isLoading ||
			productQuery.isLoading ||
			inventoryItemsQuery.isLoading ||
			loanQuery.isLoading ||
			cycleQuery.isLoading,
	};
}
