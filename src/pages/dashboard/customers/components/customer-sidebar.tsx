import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import customerService from "@/core/api/services/customer-service";
import { EntityListItem, SidebarList } from "@/core/components/common";
import type { SelectOption } from "@/core/types/common";
import type { Customer } from "@/core/types/customer";

type CustomerSidebarProps = {
	activeCustomerId: string | null;
	onSelect: (customer: Customer | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

const MAIN_TYPE_OPTIONS: SelectOption[] = [
	{ value: "vip", label: "VIP" },
	{ value: "retail", label: "Retail" },
];

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

export function CustomerSidebar({ activeCustomerId, onSelect, onToggle, isCollapsed }: CustomerSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [status, setStatus] = useState("active");
	const [customerType, setCustomerType] = useState("all");

	const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
		queryKey: ["customers", "sidebar", { name: searchTerm, status, customerType }],
		queryFn: ({ pageParam = 1 }) =>
			customerService.getCustomerList({
				page: pageParam,
				limit: 20,
				name: searchTerm || undefined,
				status: status !== "all" ? status : undefined,
				customerType: customerType !== "all" ? customerType : undefined,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => (lastPage.page < lastPage.pageCount ? lastPage.page + 1 : undefined),
	});

	const customers = data?.pages.flatMap((page) => page.list) ?? [];
	const total = data?.pages[0]?.total ?? 0;

	return (
		<SidebarList>
			<SidebarList.Header
				mainTypeOptions={MAIN_TYPE_OPTIONS}
				mainTypePlaceholder="Customer Type"
				onMainTypeChange={setCustomerType}
				onMenuClick={onToggle}
				searchPlaceholder="Search..."
				onSearchChange={setSearchTerm}
				statusOptions={STATUS_OPTIONS}
				onStatusChange={setStatus}
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				className="mt-4 divide-y divide-border-gray-300 flex-1 min-h-0"
				data={customers}
				estimateSize={56}
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
