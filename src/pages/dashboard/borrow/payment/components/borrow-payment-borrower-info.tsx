import { User } from "lucide-react";
import { useMemo } from "react";
import type { Customer } from "@/core/types/customer";
import type { Employee } from "@/core/types/employee";
import type { BorrowerType } from "@/core/types/loan";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { FormRow } from "@/pages/dashboard/borrow/components/borrow-form-row";
import { SectionHeader } from "@/pages/dashboard/borrow/components/borrow-section-header";

interface BorrowPaymentBorrowerInfoProps {
	borrowerType: BorrowerType;
	setBorrowerType: (value: BorrowerType) => void;
	borrowerId: string;
	setBorrowerId: (value: string) => void;
	customers: Customer[];
	employees: Employee[];
}

export function BorrowPaymentBorrowerInfo({
	borrowerType,
	setBorrowerType,
	borrowerId,
	setBorrowerId,
	customers,
	employees,
}: BorrowPaymentBorrowerInfoProps) {
	const options = useMemo(() => {
		if (borrowerType === "customer") {
			return customers.map((c) => ({ value: c.id, label: c.name || "Unknown Customer" }));
		}
		return employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}`.trim() || e.username }));
	}, [borrowerType, customers, employees]);

	const handleBorrowerTypeChange = (value: string) => {
		if (value === "customer" || value === "employee") {
			setBorrowerType(value);
		}
	};

	return (
		<div className="p-6 pb-2">
			<SectionHeader icon={User} title="Borrower Information" />

			<div className="pl-2 space-y-4 max-w-2xl">
				<FormRow label="Borrower Type" required>
					<div className="w-full sm:w-[200px]">
						<Select value={borrowerType} onValueChange={handleBorrowerTypeChange}>
							<SelectTrigger className="bg-white">
								<SelectValue placeholder="Select Type..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="customer">Customer</SelectItem>
								<SelectItem value="employee">Employee</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</FormRow>

				<FormRow label="Borrower Selection" required>
					<div className="w-full sm:w-[300px]">
						<Select value={borrowerId} onValueChange={setBorrowerId}>
							<SelectTrigger className="bg-white">
								<SelectValue placeholder={`Select ${borrowerType === "customer" ? "Customer" : "Employee"}...`} />
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
