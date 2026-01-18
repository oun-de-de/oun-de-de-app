import { useState } from "react";
import { settingsRows } from "@/_mock/data/dashboard";
import { SmartDataTable } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Text } from "@/core/ui/typography";

import { columns } from "./settings-columns";

type SettingsContentProps = {
	activeItem: string;
};

export function SettingsContent({ activeItem }: SettingsContentProps) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");

	// Filter based on active item (mock logic)
	// In real app, this would fetch different data based on activeItem
	const filteredRows = settingsRows.filter((row) => row.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Text variant="body2" className="font-semibold text-base text-sky-600">
					{activeItem}
				</Text>
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1">
						<Icon icon="mdi:plus" />
						New
					</Button>
					<Input
						placeholder="Search..."
						className="h-8 w-[200px]"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<SmartDataTable
				data={filteredRows}
				columns={columns}
				paginationConfig={{
					page: page,
					totalItems: filteredRows.length,
					pageSize: 20,
					totalPages: Math.ceil(filteredRows.length / 20) || 1,
					paginationItems: [1],
					onPageChange: setPage,
					onPageSizeChange: () => {},
				}}
			/>
		</>
	);
}
