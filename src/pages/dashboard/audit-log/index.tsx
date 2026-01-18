import { useState } from "react";
import { auditLogRows } from "@/_mock/data/dashboard";
import { SmartDataTable } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import { Card, CardContent } from "@/core/ui/card";
import { Text } from "@/core/ui/typography";
import { columns } from "./components/audit-log-columns";
import { AuditLogFilterBar } from "./components/audit-log-filter-bar";

export default function AuditLogPage() {
	const [page, setPage] = useState(1);

	return (
		<div className="flex w-full flex-col gap-4">
			<Card>
				<CardContent className="flex items-center gap-2 p-4">
					<Icon icon="mdi:history" className="text-slate-900 text-2xl" />
					<Text variant="body2" className="font-semibold text-slate-900 text-2xl">
						Audit Log
					</Text>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex flex-col gap-4 p-4">
					<AuditLogFilterBar />

					<SmartDataTable
						data={auditLogRows}
						columns={columns}
						paginationConfig={{
							page: page,
							pageSize: 20,
							totalItems: 180,
							totalPages: 9,
							paginationItems: [1, 2, 3, 4, "...", 9],
							onPageChange: setPage,
							onPageSizeChange: () => {},
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
