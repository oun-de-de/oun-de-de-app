import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { Customer } from "@/core/types/customer";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import type { ListState } from "../stores/customer-list-store";
import { FILTER_FIELD_OPTIONS, FILTER_TYPE_OPTIONS, getSummaryStats } from "../utils/customer-utils";
import CustomerButtonActions from "./customer-button-actions";
import { columns } from "./customer-columns";

type CustomerContentProps = {
	activeCustomer: Customer | null;
	listState: ListState;
	updateState: (state: Partial<ListState>) => void;
	pagedData: Customer[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
	isLoading?: boolean;
};

export function CustomerContent({
	activeCustomer,
	listState,
	updateState,
	pagedData,
	totalItems,
	totalPages,
	currentPage,
	paginationItems,
}: CustomerContentProps) {
	const summaryStats = getSummaryStats(activeCustomer);

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
				<CustomerButtonActions />
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{summaryStats.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={pagedData}
				columns={columns}
				filterConfig={{
					typeOptions: FILTER_TYPE_OPTIONS,
					fieldOptions: FILTER_FIELD_OPTIONS,
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
