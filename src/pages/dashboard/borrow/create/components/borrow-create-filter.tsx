import { CheckSquare, PlusCircle, Search } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";

import { FormRow } from "@/pages/dashboard/borrow/components/borrow-form-row";
import { SectionHeader } from "@/pages/dashboard/borrow/components/borrow-section-header";

export const SelectInput = ({ placeholder }: { placeholder: string }) => (
	<Select>
		<SelectTrigger className="h-9 border-gray-200 bg-white text-sm text-gray-700 focus:border-blue-400">
			<SelectValue placeholder={placeholder} />
		</SelectTrigger>
		<SelectContent>
			<SelectItem value="option-1">Option 1</SelectItem>
			<SelectItem value="option-2">Option 2</SelectItem>
		</SelectContent>
	</Select>
);

interface BorrowCreateFilterProps {
	searchText: string;
	setSearchText: (value: string) => void;
}

export function BorrowCreateFilter({ searchText, setSearchText }: BorrowCreateFilterProps) {
	return (
		<div className="p-6 pb-2">
			<SectionHeader title="Filter Items" icon={PlusCircle} />

			<div className="grid grid-cols-1 gap-y-1 max-w-3xl">
				<FormRow label="Search Item">
					<div className="relative">
						<Input
							placeholder="Barcode or Name..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="h-9 bg-white border-gray-200 focus:border-blue-400 text-sm"
						/>
						<Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
					</div>
				</FormRow>

				<FormRow label="Category">
					<SelectInput placeholder="Select Category" />
				</FormRow>

				<FormRow label="Brand / Group">
					<SelectInput placeholder="Select Brand" />
				</FormRow>

				<FormRow label="Status">
					<div className="flex items-center gap-2">
						<Button className="flex items-center gap-1.5 px-3 py-1 rounded border border-blue-500 bg-blue-50 text-blue-700 text-xs font-bold">
							<div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
								<CheckSquare className="w-2 h-2 text-white" />
							</div>
							Active
						</Button>
						<Button className="flex items-center gap-1.5 px-3 py-1 rounded border border-gray-200 bg-white text-gray-400 text-xs font-bold">
							Inactive
						</Button>
					</div>
				</FormRow>
			</div>
		</div>
	);
}
