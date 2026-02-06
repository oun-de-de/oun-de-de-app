import type { Dispatch, SetStateAction } from "react";
import Icon from "@/core/components/icon/icon";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";

// Mock data
const cashAccounts = [
	{ value: "cash", label: "Cash" },
	{ value: "bank", label: "Bank Transfer" },
];

const employees = [
	{ value: "emp1", label: "Thavit Sale" },
	{ value: "emp2", label: "Admin" },
];

type ReceiptFormProps = {
	date: string;
	setDate: Dispatch<SetStateAction<string>>;
};

export function ReceiptForm({ date, setDate }: ReceiptFormProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
			{/* Left Column */}
			<div className="space-y-4">
				<div className="grid grid-cols-3 items-center gap-4">
					<Label className="text-gray-500">Ref No</Label>
					<div className="col-span-2 flex items-center gap-2 border rounded pr-3">
						<Input value="REC 33849" readOnly className="border-none border-r border-gray-200 bg-transparent" />
						<Icon icon="mdi:barcode" className="text-gray-400" />
					</div>
				</div>

				<div className="grid grid-cols-3 items-center gap-4">
					<Label className=" font-medium">Customer</Label>
					<div className="col-span-2">
						<Input placeholder="Please enter a keyword" />
					</div>
				</div>

				<div className="grid grid-cols-3 items-center gap-4">
					<Label className=" font-medium">* Employee</Label>
					<div className="col-span-2">
						<Select>
							<SelectTrigger>
								<SelectValue placeholder="Please select" />
							</SelectTrigger>
							<SelectContent>
								{employees.map((e) => (
									<SelectItem key={e.value} value={e.value}>
										{e.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Right Column */}
			<div className="space-y-4">
				<div className="grid grid-cols-3 items-center gap-4">
					<Label className=" font-medium">* Date</Label>
					<div className="col-span-2">
						<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
					</div>
				</div>

				<div className="grid grid-cols-3 items-center gap-4">
					<Label className=" font-medium">* Cash Account</Label>
					<div className="col-span-2">
						<Select>
							<SelectTrigger>
								<SelectValue placeholder="Please Select Account" />
							</SelectTrigger>
							<SelectContent>
								{cashAccounts.map((a) => (
									<SelectItem key={a.value} value={a.value}>
										{a.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="grid grid-cols-3 items-center gap-4">
					<Label className="text-gray-500">Amount Received</Label>
					<div className="col-span-2">
						<Input type="number" placeholder="0" className="text-right" />
					</div>
				</div>
			</div>
		</div>
	);
}
