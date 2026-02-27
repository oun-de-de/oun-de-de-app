import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Checkbox } from "@/core/ui/checkbox";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";

export function ReportFilters() {
	return (
		<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<div className="grid gap-4">
				<div className="flex flex-col gap-1.5 text-red-500">
					<Label htmlFor="branch" className="text-slate-600">
						* Branch
					</Label>
					<Select defaultValue="01">
						<SelectTrigger id="branch" className="h-10 text-slate-500">
							<SelectValue placeholder="Select branch" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="01">01 : Phonm Penh</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="employee" className="text-slate-600">
						Employee
					</Label>
					<Select defaultValue="all">
						<SelectTrigger id="employee" className="h-10 text-slate-500">
							<SelectValue placeholder="Select employee" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="category" className="text-slate-600">
						Category
					</Label>
					<Select defaultValue="all">
						<SelectTrigger id="category" className="h-10 text-slate-500">
							<SelectValue placeholder="Select category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="geography" className="text-slate-600">
						Geography
					</Label>
					<Select defaultValue="all">
						<SelectTrigger id="geography" className="h-10 text-slate-500">
							<SelectValue placeholder="Select geography" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="term" className="text-slate-600">
						Term
					</Label>
					<Select defaultValue="all">
						<SelectTrigger id="term" className="h-10 text-slate-500">
							<SelectValue placeholder="Select term" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid gap-4">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="customer-type" className="text-slate-600">
						Customer Type
					</Label>
					<Select defaultValue="all">
						<SelectTrigger id="customer-type" className="h-10 text-slate-500">
							<SelectValue placeholder="Select type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="customer" className="text-slate-600">
						Customer
					</Label>
					<Select defaultValue="all">
						<SelectTrigger id="customer" className="h-10 text-slate-500">
							<SelectValue placeholder="Select customer" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="job" className="text-slate-600">
						Job
					</Label>
					<Select defaultValue="all">
						<SelectTrigger id="job" className="h-10 text-slate-500">
							<SelectValue placeholder="Please Select" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-1.5 text-red-500">
					<Label htmlFor="report-date" className="text-slate-600">
						* Report Date
					</Label>
					<Input id="report-date" type="date" defaultValue="2026-01-21" className="h-10 text-slate-500" />
				</div>

				<div className="flex flex-row items-center justify-between">
					<div className="flex items-center gap-2 pt-2">
						<Checkbox id="show-detail" />
						<Label htmlFor="show-detail" className="text-sm">
							Show Detail
						</Label>
					</div>

					<div>
						<Button className="h-10 bg-sky-500 px-9 hover:bg-sky-600">
							<Icon icon="mdi:magnify" size="1.2em" />
							Submit
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
