import { useState } from "react";
import { EntityListItem, SidebarList } from "@/core/components/common";
import type { SelectOption } from "@/core/types/common";

type Props = {
	activeBorrowId: string | null;
	onSelect: (id: string | null) => void;
};

const STATUS_OPTIONS: SelectOption[] = [
	{ value: "active", label: "Active" },
	{ value: "returned", label: "Returned" },
	{ value: "overdue", label: "Overdue" },
];

const TYPE_OPTIONS: SelectOption[] = [
	{ value: "all", label: "All Borrowings" },
	{ value: "my", label: "My Borrowings" },
];

// Mock Data for the list
const MOCK_LIST = [
	{ id: "1", name: "John Doe", code: "BR-2025-001", status: "Active" },
	{ id: "2", name: "Jane Smith", code: "BR-2025-002", status: "Active" },
	{ id: "3", name: "Alice Johnson", code: "BR-2025-003", status: "Returned" },
];

export function BorrowSidebar({ activeBorrowId, onSelect }: Props) {
	const [searchValue, setSearchValue] = useState("");
	const [statusFilter, setStatusFilter] = useState("active");
	const [typeFilter, setTypeFilter] = useState("all");

	return (
		<SidebarList>
			<SidebarList.Header
				mainTypeOptions={TYPE_OPTIONS}
				mainTypeValue={typeFilter}
				mainTypePlaceholder="Borrowing Type"
				onMainTypeChange={setTypeFilter}
				searchPlaceholder="Search ref or name..."
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				statusOptions={STATUS_OPTIONS}
				statusValue={statusFilter}
				onStatusChange={setStatusFilter}
				onMenuClick={() => console.log("Menu clicked")}
			/>

			<SidebarList.Body
				className="flex-1 min-h-0"
				data={MOCK_LIST} // In real app, filter this based on search/status
				estimateSize={56}
				height="100%"
				renderItem={(item, style) => (
					<EntityListItem
						key={item.id}
						entity={item}
						isActive={item.id === activeBorrowId}
						onSelect={onSelect}
						style={style}
					/>
				)}
			/>

			<SidebarList.Footer total={MOCK_LIST.length} />
		</SidebarList>
	);
}
