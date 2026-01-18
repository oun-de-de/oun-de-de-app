import { useState } from "react";
import { accountingAccountList, accountingRows } from "@/_mock/data/dashboard";
import { EntityListItem, ListFooter, SmartDataTable, VirtualList } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import { useAccountingList, useAccountingListActions } from "@/core/store/accountingListStore";
import type { SelectOption } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Text } from "@/core/ui/typography";
import { getPaginationItems } from "@/core/utils/pagination";
import { columns } from "./components/accounting-columns";

const rows = accountingRows;

const FILTER_TYPE_OPTIONS: SelectOption[] = [
	{ value: "journal", label: "Journal Type" },
	{ value: "invoice", label: "Invoice" },
	{ value: "receipt", label: "Receipt" },
];

const FILTER_FIELD_OPTIONS: SelectOption[] = [
	{ value: "field-name", label: "Field name" },
	{ value: "ref-no", label: "Ref No" },
	{ value: "memo", label: "Memo" },
];

export default function AccountingPage() {
	const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
	// Virtual scroll state
	const [displayedAccounts] = useState(accountingAccountList);

	const activeAccount = displayedAccounts.find((account) => account.id === activeAccountId);
	const listState = useAccountingList();
	const { updateState } = useAccountingListActions();

	return (
		<div className="flex w-full flex-col gap-4">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
				<Card className="h-full">
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Select defaultValue="type">
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Account type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="type">Account type</SelectItem>
									<SelectItem value="asset">Asset</SelectItem>
									<SelectItem value="liability">Liability</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline" size="icon" className="h-9 w-9">
								<Icon icon="mdi:menu" />
							</Button>
						</div>

						<div className="mt-3 flex gap-2">
							<Input placeholder="Search..." />
							<Select defaultValue="active">
								<SelectTrigger className="w-[110px]">
									<SelectValue placeholder="Active" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<VirtualList
							className="mt-4 flex-1 divide-y divide-border-gray-300"
							data={displayedAccounts}
							estimateSize={56}
							height="calc(100vh - 250px)"
							renderItem={(account, style) => (
								<EntityListItem
									key={account.id}
									entity={account}
									isActive={account.id === activeAccountId}
									onSelect={setActiveAccountId}
									style={style}
								/>
							)}
						/>

						<ListFooter total={accountingAccountList.length} />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex flex-col gap-4 p-4">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<Button size="sm" className="gap-1">
									<Icon icon="mdi:bank" />
									Chart of Account
								</Button>
								<Text variant="body2" className="text-muted-foreground">
									{activeAccount ? `${activeAccount.name} selected` : "No item selected"}
								</Text>
							</div>
							<Button size="sm" className="gap-2">
								<Icon icon="mdi:plus" />
								Create Journal
								<Icon icon="mdi:chevron-down" />
							</Button>
						</div>

						<SmartDataTable
							data={rows}
							columns={columns}
							filterConfig={{
								typeOptions: FILTER_TYPE_OPTIONS,
								fieldOptions: FILTER_FIELD_OPTIONS,
								typeValue: listState.typeFilter,
								fieldValue: listState.fieldFilter,
								searchValue: listState.searchValue,
								onTypeChange: (value) => updateState({ typeFilter: value, page: 1 }),
								onFieldChange: (value) => updateState({ fieldFilter: value, page: 1 }),
								onSearchChange: (value) => updateState({ searchValue: value, page: 1 }),
							}}
							paginationConfig={{
								page: listState.page,
								pageSize: listState.pageSize,
								totalItems: 46166,
								totalPages: 2309,
								paginationItems: getPaginationItems(listState.page, 2309),
								onPageChange: (nextPage) => updateState({ page: nextPage }),
								onPageSizeChange: (nextSize) => updateState({ pageSize: nextSize, page: 1 }),
							}}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
