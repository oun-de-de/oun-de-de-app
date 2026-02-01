import { customerSummaryCards } from "@/_mock/data/dashboard";
import { SmartDataTable, SplitButton, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { Customer } from "@/core/types/customer";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { useRouter } from "@/routes/hooks";
import { columns } from "./customer-columns";

type CustomerContentProps = {
	activeCustomerName: string | null | undefined;
	listState: any; // Using exact type from store would be better if exported
	updateState: (state: any) => void;
	pagedData: Customer[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
	isLoading?: boolean;
};

const summaryCards = customerSummaryCards;

const filterTypeOptions = [
	{ value: "all", label: "All Status" },
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

const filterFieldOptions = [
	{ value: "all", label: "All Fields" },
	{ value: "name", label: "Name" },
	{ value: "code", label: "Code" },
];

export function CustomerContent({
	activeCustomerName,
	listState,
	updateState,
	pagedData,
	totalItems,
	totalPages,
	currentPage,
	paginationItems,
}: CustomerContentProps) {
	const router = useRouter();

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1">
						<Icon icon="mdi:account-multiple-outline" />
						Customer
					</Button>
					<Text variant="body2" className="text-slate-400">
						{activeCustomerName ? `${activeCustomerName} selected` : "No Customer Selected"}
					</Text>
				</div>
				<SplitButton
					mainAction={{
						label: (
							<>
								<Icon icon="mdi:plus" className="mr-2 h-4 w-4" />
								Create Customer
							</>
						),
						onClick: () => router.push("/dashboard/customers/create"),
					}}
					options={[
						{
							label: "Create Invoice",
							onClick: () => console.log("Create Invoice clicked"),
						},
						{
							label: "Create Cash Sale",
							onClick: () => console.log("Create Cash Sale clicked"),
						},
						{
							label: "Create Receipt",
							onClick: () => console.log("Create Receipt clicked"),
						},
					]}
					size="sm"
				/>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={pagedData}
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
