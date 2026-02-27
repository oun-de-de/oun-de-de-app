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
};

const STATUS_OPTIONS: SelectOption[] = [{ value: "all", label: "All" }];
const DEFAULT_ITEM_SIZE = 56;
const COLLAPSED_ITEM_SIZE = 42;
const COLLAPSED_ITEM_GAP = 8;

export function CustomerSidebar({ activeCustomerId, onSelect, onToggle, isCollapsed }: CustomerSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [customerType, setCustomerType] = useState("all");
	const [customerTypeInput, setCustomerTypeInput] = useState("all");
	const [paymentTerm, setPaymentTerm] = useState("");

	const handleCustomerTypeChange = (value: string) => {
		const nextValue = value.trim().toLowerCase();
		setCustomerTypeInput(nextValue);

		if (!nextValue || nextValue === "all") {
			setCustomerType("all");
			setPaymentTerm("");
			return;
		}

		if (/^\d+$/.test(nextValue)) {
			setCustomerType("all");
			setPaymentTerm(nextValue);
			return;
		}

		if (nextValue !== "vip" && nextValue !== "retail") {
			setCustomerType("all");
			setPaymentTerm("");
			return;
		}

		setPaymentTerm("");
		setCustomerType(nextValue);
	};

	const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
		queryKey: ["customers", "sidebar", { name: searchTerm, customerType, paymentTerm }],
		queryFn: ({ pageParam = 1 }) =>
			customerService.getCustomerList({
				page: pageParam,
				limit: 10000,
				name: searchTerm || undefined,
				customerType: customerType !== "all" ? customerType : undefined,
				paymentTerm: paymentTerm ? Number(paymentTerm) : undefined,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => (lastPage.page < lastPage.pageCount ? lastPage.page + 1 : undefined),
	});

	const customers = data?.pages.flatMap((page) => page.list) ?? [];
	const total = data?.pages[0]?.total ?? 0;

	return (
		<SidebarList>
			<SidebarList.Header
				mainTypePlaceholder="Customer Type"
				mainTypeFilter={<CustomerTypeCombobox value={customerTypeInput} onChange={handleCustomerTypeChange} />}
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
				onPrev={() => {}}
				onNext={() => fetchNextPage()}
				hasPrev={false}
				hasNext={!!hasNextPage}
				showControls={hasNextPage || customers.length > 0}
			/>
		</SidebarList>
	);
}
