import Icon from "@/components/icon/icon";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/ui/select";
import { Text } from "@/ui/typography";
import { TablePagination } from "@/components/common";
import { useState } from "react";
import { auditLogRows } from "@/_mock/data/dashboard";

export default function AuditLogPage() {
	const [page, setPage] = useState(1);

	return (
		<div className="flex w-full flex-col gap-4">
			<Card>
				<CardContent className="flex items-center gap-2 p-4">
					<Icon icon="mdi:history" />
					<Text variant="body2" className="font-semibold">
						Audit Log
					</Text>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex flex-col gap-4 p-4">
					<div className="grid grid-cols-1 gap-2 lg:grid-cols-6">
						<Input type="date" />
						<Input type="date" />
						<Select defaultValue="hour">
							<SelectTrigger>
								<SelectValue placeholder="Time" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="hour">01:00</SelectItem>
								<SelectItem value="two">02:00</SelectItem>
							</SelectContent>
						</Select>
						<Select defaultValue="event">
							<SelectTrigger>
								<SelectValue placeholder="Select event..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="event">Select event...</SelectItem>
								<SelectItem value="sale">Sale Invoice</SelectItem>
								<SelectItem value="journal">Journal Entry</SelectItem>
							</SelectContent>
						</Select>
						<Select defaultValue="user">
							<SelectTrigger>
								<SelectValue placeholder="Select user..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="user">Select user...</SelectItem>
								<SelectItem value="lc1988">lc1988</SelectItem>
								<SelectItem value="lmchann">lmchann</SelectItem>
							</SelectContent>
						</Select>
						<Select defaultValue="type">
							<SelectTrigger>
								<SelectValue placeholder="Select type..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="type">Select type...</SelectItem>
								<SelectItem value="add">Add</SelectItem>
								<SelectItem value="update">Update</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-2">
						<Input placeholder="Search..." className="flex-1" />
						<Button variant="outline" size="icon" className="h-9 w-9">
							<Icon icon="mdi:magnify" />
						</Button>
					</div>

					<div className="overflow-x-auto rounded-lg border">
						<table className="min-w-full text-sm">
							<thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
								<tr>
									<th className="px-3 py-2 text-left">Date</th>
									<th className="px-3 py-2 text-left">User</th>
									<th className="px-3 py-2 text-left">Event</th>
									<th className="px-3 py-2 text-left">History</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{auditLogRows.map((row) => (
									<tr key={`${row.date}-${row.user}`} className="hover:bg-muted/30">
										<td className="px-3 py-2 text-muted-foreground">{row.date}</td>
										<td className="px-3 py-2">{row.user}</td>
										<td className="px-3 py-2">{row.event}</td>
										<td className="px-3 py-2">
											<Button variant="link" className="h-auto p-0 text-sky-600">
												View
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<TablePagination
						pages={[1, 2, 3, 4, "...", 9]}
						currentPage={page}
						totalItems={180}
						pageSize={20}
						pageSizeOptions={[10, 20, 50]}
						goToValue={String(page)}
						onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
						onNext={() => setPage((prev) => Math.min(9, prev + 1))}
						onPageChange={setPage}
						onPageSizeChange={() => {}}
						onGoToChange={(value) => setPage(Number(value) || 1)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
