import { vendorList } from "@/_mock/data/dashboard";
import { EntityListItem, SidebarList } from "@/core/components/common";

import type { SelectOption } from "@/core/types/common";

type VendorSidebarProps = {
	activeVendorId: string | null;
	onSelect: (id: string | null) => void;
};

const MAIN_TYPE_OPTIONS: SelectOption[] = [
	{ value: "preferred", label: "Preferred" },
	{ value: "standard", label: "Standard" },
];

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

export function VendorSidebar({ activeVendorId, onSelect }: VendorSidebarProps) {
	return (
		<SidebarList>
			<SidebarList.Header
				mainTypeOptions={MAIN_TYPE_OPTIONS}
				mainTypePlaceholder="Vendor Type"
				onMainTypeChange={() => {}}
				onMenuClick={() => {}}
				searchPlaceholder="Search..."
				onSearchChange={() => {}}
				statusOptions={STATUS_OPTIONS}
				onStatusChange={() => {}}
			/>

			<SidebarList.Body
				className="mt-4 divide-y divide-border-gray-300 flex-1 min-h-0"
				data={vendorList}
				estimateSize={56}
				height="100%"
				renderItem={(vendor, style) => (
					<EntityListItem
						key={vendor.id}
						entity={vendor}
						isActive={vendor.id === activeVendorId}
						onSelect={onSelect}
						style={style}
					/>
				)}
			/>

			<SidebarList.Footer total={200} />
		</SidebarList>
	);
}
