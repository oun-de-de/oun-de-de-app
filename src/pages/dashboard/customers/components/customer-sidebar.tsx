import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import customerService from "@/core/api/services/customer-service";
import { EntityListItem, SidebarList } from "@/core/components/common";
import type { SelectOption } from "@/core/types/common";
import type { Customer } from "@/core/types/customer";
import { cn } from "@/core/utils";
import { CustomerTypeCombobox } from "./customer-type-combobox";

type CustomerSidebarProps = {
	activeCustomerId: string | null;
	onSelect: (customer: Customer | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
	showPaymentTermFilter?: boolean;
};

const STATUS_OPTIONS: SelectOption[] = [{ value: "all", label: "All" }];
const PAGE_SIZE = 10;
const DEFAULT_ITEM_SIZE = 56;
const COLLAPSED_ITEM_SIZE = 42;
const COLLAPSED_ITEM_GAP = 8;

export function CustomerSidebar({
	activeCustomerId,
	onSelect,
	onToggle,
	isCollapsed,
	showPaymentTermFilter = true,
}: CustomerSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [paymentTermInput, setPaymentTermInput] = useState("");
	const [paymentTerm, setPaymentTerm] = useState("");

	const handlePaymentTermChange = (value: string) => {
		const nextValue = value.trim().toLowerCase();
		setPaymentTermInput(nextValue);
		setPaymentTerm(/^\d+$/.test(nextValue) ? nextValue : "");
	};

	const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: ["customers", "sidebar", { name: searchTerm, paymentTerm }],
		queryFn: ({ pageParam }) =>
			customerService.getCustomerList({
				page: pageParam,
				limit: PAGE_SIZE,
				name: searchTerm || undefined,
				paymentTerm: paymentTerm ? Number(paymentTerm) : undefined,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage <= lastPage.pageCount ? nextPage : undefined;
		},
	});

	const customers = data?.pages.flatMap((p) => p.list) ?? [];
	const total = data?.pages[0]?.total ?? customers.length;

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={showPaymentTermFilter}
				showStatusFilter={false}
				mainTypePlaceholder="Payment Term"
				mainTypeFilter={<CustomerTypeCombobox value={paymentTermInput} onChange={handlePaymentTermChange} />}
				onMenuClick={onToggle}
				searchPlaceholder="Search..."
				onSearchChange={setSearchTerm}
				statusOptions={STATUS_OPTIONS}
				statusValue="all"
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				key={isCollapsed ? "collapsed" : "expanded"}
				className={cn("mt-2 flex-1 min-h-0", !isCollapsed && "divide-y divide-border-gray-300")}
				data={customers}
				estimateSize={isCollapsed ? COLLAPSED_ITEM_SIZE : DEFAULT_ITEM_SIZE}
				gap={isCollapsed ? COLLAPSED_ITEM_GAP : 0}
				height="100%"
				renderItem={(customer: Customer, style) => (
					<EntityListItem
						key={customer.id}
						entity={{
							id: customer.id,
							name: customer.name,
							code: customer.code,
						}}
						isActive={customer.id === activeCustomerId}
						onSelect={() => onSelect(customer.id === activeCustomerId ? null : customer)}
						style={style}
						isCollapsed={isCollapsed}
					/>
				)}
			/>

			<SidebarList.Footer
				total={total}
				isCollapsed={isCollapsed}
				onNext={() => fetchNextPage()}
				hasPrev={false}
				hasNext={hasNextPage}
				showControls={hasNextPage}
			/>
		</SidebarList>
	);
}
