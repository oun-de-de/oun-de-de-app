import { customerList } from "@/_mock/data/dashboard";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { up, useMediaQuery } from "@/core/hooks/use-media-query";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import type { SelectOption } from "@/core/types/common";

type CustomerSidebarProps = {
	activeCustomerId: string | null;
	onSelect: (id: string | null) => void;
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
	const isLgUp = useMediaQuery(up("lg"));

	const pagination = useSidebarPagination({
		data: customerList,
		enabled: !isLgUp,
	});

	return (
		<SidebarList>
			<SidebarList.Header
				mainTypeOptions={MAIN_TYPE_OPTIONS}
				mainTypePlaceholder="Customer Type"
				onMainTypeChange={() => {}}
				onMenuClick={onToggle}
				searchPlaceholder="Search..."
				onSearchChange={() => {}}
				statusOptions={STATUS_OPTIONS}
				onStatusChange={() => {}}
				isCollapsed={isCollapsed}
			/>

			<SidebarList.Body
				className="mt-4 divide-y divide-border-gray-300 flex-1 min-h-0"
				data={pagination.pagedData}
				estimateSize={56}
				height="100%"
				renderItem={(customer, style) => (
					<EntityListItem
						key={customer.id}
						entity={customer}
						isActive={customer.id === activeCustomerId}
						onSelect={onSelect}
						style={style}
						isCollapsed={isCollapsed}
					/>
				)}
			/>

			<SidebarList.Footer
				total={pagination.total}
				isCollapsed={isCollapsed}
				onPrev={pagination.handlePrev}
				onNext={pagination.handleNext}
				hasPrev={pagination.hasPrev}
				hasNext={pagination.hasNext}
				showControls={!isLgUp && pagination.totalPages > 1}
			/>
		</SidebarList>
	);
}
