import { useMemo } from "react";
import { vendorList } from "@/_mock/data/dashboard";
import { EntityListItem, SidebarList } from "@/core/components/common";
import { useSidebarPagination } from "@/core/hooks/use-sidebar-pagination";
import { normalizeToken } from "@/core/utils/dashboard-utils";

type VendorSidebarProps = {
	activeVendorId: string | null;
	onSelect: (id: string | null) => void;
	searchValue: string;
	onSearchChange: (value: string) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

export function VendorSidebar({
	activeVendorId,
	onSelect,
	searchValue,
	onSearchChange,
	onToggle,
	isCollapsed,
}: VendorSidebarProps) {
	const filteredVendors = useMemo(() => {
		const normalizedQuery = normalizeToken(searchValue);
		if (!normalizedQuery) return vendorList;

		return vendorList.filter((vendor) => {
			const searchableText = `${vendor.name} ${vendor.code}`.trim().toLowerCase();
			return searchableText.includes(normalizedQuery);
		});
	}, [searchValue]);

	const pagination = useSidebarPagination({
		data: filteredVendors,
	});

	return (
		<SidebarList>
			<SidebarList.Header
				showMainTypeFilter={false}
				showStatusFilter={false}
				onMenuClick={onToggle}
				searchPlaceholder="Search vendors..."
				searchValue={searchValue}
				onSearchChange={onSearchChange}
				isCollapsed={isCollapsed}
			/>

			{isCollapsed ? (
				<SidebarList.CollapsedHint text="Click to expand vendor list" onClick={onToggle} />
			) : (
				<>
					<SidebarList.Body
						className="mt-4 flex-1 min-h-0 divide-y divide-border-gray-300"
						data={pagination.pagedData}
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
					/>
				</>
			)}
		</SidebarList>
	);
}
