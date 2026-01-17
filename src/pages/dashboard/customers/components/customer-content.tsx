import { customerList, customerSummaryCards } from "@/_mock/data/dashboard";
import { SmartDataTable, SummaryStatCard } from "@/components/common";
import Icon from "@/components/icon/icon";
import type { TransactionRow } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { columns } from "./customer-columns";

type CustomerContentProps = {
	activeCustomerId: string | null;
	listState: any; // Using exact type from store would be better if exported
	updateState: (state: any) => void;
	pagedTransactions: TransactionRow[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
};

const summaryCards = customerSummaryCards;

const filterTypeOptions = [
	{ value: "all", label: "All" },
	{ value: "cash-sale", label: "Cash Sale" },
	{ value: "invoice", label: "Invoice" },
	{ value: "receipt", label: "Receipt" },
];

const filterFieldOptions = [
	{ value: "field-name", label: "Field name" },
	{ value: "customer", label: "Customer" },
	{ value: "ref-no", label: "Ref No" },
];

export function CustomerContent({
	activeCustomerId,
	listState,
	updateState,
	pagedTransactions,
	totalItems,
	totalPages,
	currentPage,
	paginationItems,
}: CustomerContentProps) {
	const activeCustomer = customerList.find((customer) => customer.id === activeCustomerId);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1">
						<Icon icon="mdi:account-multiple-outline" />
						Customer
					</Button>
					<Text variant="body2" className="text-slate-400">
						{activeCustomer ? `${activeCustomer.name} selected` : "No Customer Selected"}
					</Text>
				</div>
				<Button size="sm" className="gap-2">
					<Icon icon="mdi:plus" />
					Create Invoice
					<Icon icon="mdi:chevron-down" />
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				data={pagedTransactions}
				columns={columns}
				filterConfig={{
					typeOptions: filterTypeOptions,
					fieldOptions: filterFieldOptions,
					typeValue: listState.typeFilter,
					fieldValue: listState.fieldFilter,
					searchValue: listState.searchValue,
					onTypeChange: (value: string) => updateState({ typeFilter: value, page: 1 }),
					onFieldChange: (value: string) => updateState({ fieldFilter: value, page: 1 }),
					onSearchChange: (value: string) => updateState({ searchValue: value, page: 1 }),
				}}
				paginationConfig={{
					page: currentPage,
					pageSize: listState.pageSize,
					totalItems: totalItems,
					totalPages: totalPages,
					paginationItems: paginationItems,
					onPageChange: (nextPage: number) => updateState({ page: nextPage }),
					onPageSizeChange: (nextSize: number) => updateState({ pageSize: nextSize, page: 1 }),
				}}
			/>
		</>
	);
}
