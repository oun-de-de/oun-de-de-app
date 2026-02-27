import { useMemo } from "react";
import type { Customer } from "@/core/types/customer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { FormRow } from "@/pages/dashboard/borrow/components/borrow-form-row";


interface BorrowPaymentBorrowerInfoProps {
	borrowerId: string;
	setBorrowerId: (value: string) => void;
	customers: Customer[];
}

export function BorrowPaymentBorrowerInfo({ borrowerId, setBorrowerId, customers }: BorrowPaymentBorrowerInfoProps) {
	const options = useMemo(
		() => customers.map((c) => ({ value: c.id, label: c.name || "Unknown Customer" })),
		[customers],
	);

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-2">Borrower Information</h2>
				<p className="text-sm text-slate-500">Select the customer who is applying for the loan.</p>
			</div>

			<div className="space-y-4 max-w-lg">
				<FormRow label="Customer" required>
					<div className="w-full">
						<Select value={borrowerId} onValueChange={setBorrowerId}>
							<SelectTrigger className="bg-white h-11 border-slate-200 hover:border-slate-300 font-medium text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20">
								<SelectValue placeholder="Select customer..." />
							</SelectTrigger>
							<SelectContent>
								{options.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</FormRow>
			</div>
		</div>
	);
}
