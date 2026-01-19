import { useMemo, useState } from "react";

import * as dashboard from "@/_mock/data/dashboard";
import { EntityListItem, SidebarList } from "@/core/components/common";
import type { SelectOption } from "@/core/types/common";
import { normalizeToken } from "@/core/utils/dashboard-utils";

type ProductSidebarProps = {
	activeProductId: string | null;
	onSelect: (id: string | null) => void;
};

const MAIN_TYPE_OPTIONS: SelectOption[] = [
	{ value: "all", label: "All Types" },
	{ value: "inventory", label: "Inventory" },
	{ value: "service", label: "Service" },
];

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "all", label: "All Status" },
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

export function ProductSidebar({ activeProductId, onSelect }: ProductSidebarProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [mainType, setMainType] = useState("all");
	const [status, setStatus] = useState("all");

	const filteredProducts = useMemo(() => {
		const normalizedSearch = normalizeToken(searchTerm);
		const normalizedType = normalizeToken(mainType);
		const normalizedStatus = normalizeToken(status);

		return dashboard.productList.filter((product) => {
			// Filter by Type
			if (normalizedType !== "all") {
				const productType = normalizeToken(product.type || "");
				if (productType !== normalizedType) return false;
			}

			// Filter by Status
			if (normalizedStatus !== "all") {
				const productStatus = normalizeToken(product.status || "");
				if (productStatus !== normalizedStatus) return false;
			}

			// Filter by Search (Name or Code)
			if (normalizedSearch) {
				const name = normalizeToken(product.name || "");
				const code = normalizeToken(product.code || "");
				if (!name.includes(normalizedSearch) && !code.includes(normalizedSearch)) {
					return false;
				}
			}

			return true;
		});
	}, [searchTerm, mainType, status]);

	return (
		<SidebarList>
			<SidebarList.Header
				mainTypeOptions={MAIN_TYPE_OPTIONS}
				mainTypePlaceholder="Item Type"
				onMainTypeChange={setMainType}
				onMenuClick={() => {}}
				searchPlaceholder="Search..."
				onSearchChange={setSearchTerm}
				statusOptions={STATUS_OPTIONS}
				onStatusChange={setStatus}
			/>

			<SidebarList.Body
				className="mt-4 divide-y divide-border-gray-300 flex-1 min-h-0"
				data={filteredProducts}
				estimateSize={56}
				height="auto"
				renderItem={(item, style) => (
					<EntityListItem
						key={item.id}
						entity={item}
						isActive={item.id === activeProductId}
						onSelect={onSelect}
						style={style}
					/>
				)}
			/>

			<SidebarList.Footer total={filteredProducts.length} />
		</SidebarList>
	);
}
