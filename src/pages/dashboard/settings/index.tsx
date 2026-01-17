import Icon from "@/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Text } from "@/core/ui/typography";
import { SmartDataTable } from "@/components/common";
import { useState } from "react";
import { settingsLeftMenu, settingsRows, settingsTopTabs } from "@/_mock/data/dashboard";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<(typeof settingsRows)[0]>[] = [
	{
		header: "Name",
		accessorKey: "name",
		meta: { className: "text-sky-600" },
	},
	{
		header: "Type",
		accessorKey: "type",
		meta: { className: "text-gray-600" },
	},
];

export default function SettingsPage() {
	const [page, setPage] = useState(1);

	return (
		<div className="flex w-full flex-col gap-4">
			<Card>
				<CardContent className="flex flex-wrap items-center gap-2 p-3">
					{settingsTopTabs.map((tab, index) => (
						<Button key={tab} variant={index === 0 ? "default" : "ghost"} size="sm">
							{tab}
						</Button>
					))}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
				<Card className="h-full">
					<CardContent className="p-3">
						<div className="flex flex-col gap-1">
							{settingsLeftMenu.map((item, index) => (
								<Button key={item} variant={index === 0 ? "default" : "ghost"} className="justify-start" size="sm">
									<Icon icon="mdi:checkbox-blank-circle-outline" className="mr-2 text-xs" />
									{item}
								</Button>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex flex-col gap-4 p-4">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<Text variant="body2" className="font-semibold">
								Unit
							</Text>
							<div className="flex items-center gap-2">
								<Button size="sm" className="gap-1">
									<Icon icon="mdi:plus" />
									New
								</Button>
								<Input placeholder="Search..." className="h-8 w-[200px]" />
							</div>
						</div>

						<SmartDataTable
							data={settingsRows}
							columns={columns}
							paginationConfig={{
								page: page,
								totalItems: settingsRows.length,
								pageSize: 20,
								totalPages: 1,
								paginationItems: [1],
								onPageChange: setPage,
								onPageSizeChange: () => {},
							}}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
