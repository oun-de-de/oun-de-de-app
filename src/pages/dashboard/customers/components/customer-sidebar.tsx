import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import customerService from "@/core/api/services/customer-service";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import type { SelectOption } from "@/core/types/common";
import type { Customer } from "@/core/types/customer";
import { cn } from "@/core/utils";
import { CustomerTypeCombobox } from "./customer-type-combobox";

type CustomerSidebarProps = {
	activeCustomerId: string | null;
	activeCustomerName?: string | null;
	onSelect: (customer: Customer | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
	showPaymentTermFilter?: boolean;
};

const STATUS_OPTIONS: SelectOption[] = [{ value: "all", label: "All" }];
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_ITEM_SIZE = 56;

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
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

	const handlePaymentTermChange = (value: string) => {
		const nextValue = value.trim().toLowerCase();
		setPaymentTermInput(nextValue);
		setPaymentTerm(/^\d+$/.test(nextValue) ? nextValue : "");
	};

	const { data } = useQuery({
		queryKey: ["customers", "sidebar", { name: searchTerm, paymentTerm }],
		queryFn: () =>
			customerService.getCustomerList({
				page: 1,
				limit: 1000,
				name: searchTerm || undefined,
				paymentTerm: paymentTerm ? Number(paymentTerm) : undefined,
			}),
	});

	const customers = data?.list ?? [];
	// Kept for reference: the sidebar previously pinned the active customer above the list
	// when it was outside the current page/filter result. We intentionally disabled that UX
	// to keep the list "clean" after back navigation.
	//
	// const hasVisibleActiveCustomer = activeCustomerId
	// 	? customers.some((customer) => customer.id === activeCustomerId)
	// 	: false;
	// const shouldShowPinnedActiveCustomer =
	// 	Boolean(activeCustomerId) && Boolean(activeCustomerName) && !hasVisibleActiveCustomer;
	const pagination = useSidebarPagination({
		data: customers,
		pageSize,
		resetKey: `${searchTerm}|${paymentTerm}|${pageSize}`,
	});

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={showPaymentTermFilter}
				showStatusFilter={false}
				mainTypePlaceholder="Payment Term"
				mainTypeFilter={<CustomerTypeCombobox value={paymentTermInput} onChange={handlePaymentTermChange} />}
				onMenuClick={onToggle}
				searchPlaceholder="Search for customer"
				onSearchChange={setSearchTerm}
				statusOptions={STATUS_OPTIONS}
				statusValue="all"
				isCollapsed={isCollapsed}
			/>

			{isCollapsed ? (
				<SidebarList.CollapsedHint text="Click to expand customer list" onClick={onToggle} />
			) : (
				<>
					{/* Preserved for reference. We intentionally keep this disabled to avoid
					    showing a separately pinned "Selected Customer" block in the sidebar. */}
					{/* {shouldShowPinnedActiveCustomer ? (
						<div className="mt-2 space-y-2">
							<div className="px-1 text-xs font-medium uppercase tracking-wide text-slate-500">Selected Customer</div>
							<EntityListItem
								entity={{
									id: activeCustomerId!,
									name: activeCustomerName!,
									code: "",
								}}
								isActive
								onSelect={() => onSelect(null)}
								className="rounded"
							/>
						</div>
					) : null} */}

					<SidebarList.Body
						key="expanded"
						className={cn("mt-2 flex-1 min-h-0 divide-y divide-border-gray-300")}
						data={pagination.pagedData}
						estimateSize={DEFAULT_ITEM_SIZE}
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
							/>
						)}
					/>

					<SidebarList.Footer
						total={pagination.total}
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						rangeStart={pagination.rangeStart}
						rangeEnd={pagination.rangeEnd}
						isCollapsed={false}
						onPrev={pagination.handlePrev}
						onNext={pagination.handleNext}
						hasPrev={pagination.hasPrev}
						hasNext={pagination.hasNext}
						showControls={pagination.totalPages > 1}
						pageSize={pageSize}
						pageSizeOptions={PAGE_SIZE_OPTIONS}
						onPageSizeChange={setPageSize}
					/>
				</>
			)}
		</SidebarList>
	);
}
