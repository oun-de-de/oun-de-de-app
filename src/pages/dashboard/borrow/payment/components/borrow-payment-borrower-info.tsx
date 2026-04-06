import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Customer } from "@/core/types/customer";
import type { Employee } from "@/core/types/employee";
import { Button } from "@/core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { FormRow } from "@/pages/dashboard/borrow/components/borrow-form-row";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";
import type { BorrowPaymentFormValues } from "../hooks/use-borrow-payment-form";

interface BorrowPaymentBorrowerInfoProps {
	form: UseFormReturn<BorrowPaymentFormValues>;
	customers: Customer[];
	employees: Employee[];
}

export function BorrowPaymentBorrowerInfo({ form, customers, employees }: BorrowPaymentBorrowerInfoProps) {
	const {
		watch,
		setValue,
		formState: { errors },
	} = form;
	const borrowerType = watch("borrowerType");
	const borrowerId = watch("borrowerId");
	const employeeId = watch("employeeId");

	const customerOptions = useMemo(
		() => customers.map((c) => ({ value: c.id, label: c.name || "Unknown Customer" })),
		[customers],
	);
	const employeeOptions = useMemo(
		() =>
			employees.map((employee) => ({
				value: employee.id,
				label: getEmployeeDisplayName(employee),
			})),
		[employees],
	);

	const selectedId = borrowerType === "customer" ? borrowerId : employeeId;

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-2">Borrower Information</h2>
				<p className="text-sm text-slate-500">Choose one borrower type and select a single borrower.</p>
			</div>

			<div className="space-y-4 max-w-lg">
				<div className="flex gap-2">
					<Button
						type="button"
						variant={borrowerType === "customer" ? "default" : "outline"}
						onClick={() => {
							setValue("borrowerType", "customer");
							setValue("employeeId", "");
						}}
					>
						Customer
					</Button>
					<Button
						type="button"
						variant={borrowerType === "employee" ? "default" : "outline"}
						onClick={() => {
							setValue("borrowerType", "employee");
							setValue("borrowerId", "");
						}}
					>
						Employee
					</Button>
				</div>

				<FormRow
					label={borrowerType === "customer" ? "Customer" : "Employee"}
					required
					error={borrowerType === "customer" ? errors.borrowerId?.message : errors.employeeId?.message}
				>
					<div className="w-full">
						<Select
							value={selectedId || ""}
							onValueChange={(val) => {
								if (borrowerType === "customer") {
									setValue("borrowerId", val, { shouldValidate: true });
								} else {
									setValue("employeeId", val, { shouldValidate: true });
								}
							}}
						>
							<SelectTrigger className="bg-white h-11 border-slate-200 hover:border-slate-300 font-medium text-slate-700 shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20">
								<SelectValue placeholder={borrowerType === "customer" ? "Select customer..." : "Select employee..."} />
							</SelectTrigger>
							<SelectContent>
								{(borrowerType === "customer" ? customerOptions : employeeOptions).map((opt) => (
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
