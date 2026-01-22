import { customerList } from "@/_mock/data/dashboard";
import { EntityListItem, SidebarList } from "@/core/components/common";
import type { SelectOption } from "@/core/types/common";

type CustomerSidebarProps = {
	activeCustomerId: string | null;
	onSelect: (id: string | null) => void;
};

const MAIN_TYPE_OPTIONS: SelectOption[] = [
	{ value: "vip", label: "VIP" },
	{ value: "retail", label: "Retail" },
];

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

export function CustomerSidebar({ activeCustomerId, onSelect }: CustomerSidebarProps) {
	return (
		<SidebarList>
			<SidebarList.Header
				mainTypeOptions={MAIN_TYPE_OPTIONS}
				mainTypePlaceholder="Customer Type"
				onMainTypeChange={() => {}}
				onMenuClick={() => {}}
				searchPlaceholder="Search..."
				onSearchChange={() => {}}
				statusOptions={STATUS_OPTIONS}
				onStatusChange={() => {}}
			/>

			<SidebarList.Body
				className="mt-4 divide-y divide-border-gray-300 flex-1 min-h-0"
				data={customerList}
				estimateSize={56}
				height="100%"
				renderItem={(customer, style) => (
					<EntityListItem
						key={customer.id}
						entity={customer}
						isActive={customer.id === activeCustomerId}
						onSelect={onSelect}
						style={style}
					/>
				)}
			/>

			<SidebarList.Footer total={200} />
		</SidebarList>
	);
}
