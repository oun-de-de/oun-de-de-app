import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { useNavigate } from "react-router";
import { useEquipmentContent } from "../hooks/use-equipment-content";
import { CreateItemDialog } from "./create-item-dialog";

type Props = {
	activeItemId: string | null;
};

const EQUIPMENT_TYPE_OPTIONS = [
	{ value: "all", label: "All Type" },
	{ value: "consumable", label: "Consumable" },
	{ value: "equipment", label: "Equipment" },
];

const EQUIPMENT_FIELD_OPTIONS = [
	{ value: "name", label: "Name" },
	{ value: "code", label: "Code" },
];

const SEARCH_PLACEHOLDER = "Search items";

export function EquipmentContent({ activeItemId }: Props) {
	const navigate = useNavigate();
	const { activeItem, summaryCards, createItem, table, getRowLink } = useEquipmentContent(activeItemId);

	return (
		<>
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1">
						Equipment
					</Button>
					<Text variant="body2" className="text-slate-400">
						{activeItem ? `${activeItem.name} selected` : "All equipment"}
					</Text>
				</div>
				<div className="flex gap-2">
					<CreateItemDialog onSubmit={(data) => createItem.mutate(data)} isPending={createItem.isPending} />
				</div>
			</div>

			{/* Summary */}
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			{/* Transaction Table */}
			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={table.pagedRows}
				columns={table.columns}
				onRowClick={(row) => {
					const link = getRowLink(row);
					if (link) navigate(link);
				}}
				filterConfig={{
					typeOptions: EQUIPMENT_TYPE_OPTIONS,
					fieldOptions: EQUIPMENT_FIELD_OPTIONS,
					typeValue: table.typeFilter,
					fieldValue: table.fieldFilter,
					searchValue: table.searchValue,
					onTypeChange: table.setTypeFilter,
					onFieldChange: table.setFieldFilter,
					onSearchChange: table.setSearchValue,
					searchPlaceholder: SEARCH_PLACEHOLDER,
				}}
			/>
		</>
	);
}
