import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import employeeService from "@/core/api/services/employee-service";
import loanService from "@/core/api/services/loan-service";
import type { BorrowerType } from "@/core/types/loan";
import { getTodayUTC, toUtcIsoPreferNowIfToday } from "@/core/utils/date-utils";

export function useBorrowPaymentForm() {
	const navigate = useNavigate();

	const [borrowerType, setBorrowerType] = useState<BorrowerType>("customer");
	const [borrowerId, setBorrowerId] = useState("");
	const [employeeId, setEmployeeId] = useState("");
	const [monthlyAmount, setMonthlyAmount] = useState<string>("");

	const [depositAmount, setDepositAmount] = useState<string>("");
	const [dueDate, setDueDate] = useState(getTodayUTC);

	// Fetch Customers
	const { data: customers = [] } = useQuery({
		queryKey: ["customers-list"],
		queryFn: () => customerService.getCustomerList({ limit: 1000 }).then((res) => res.list),
	});
	const { data: employees = [] } = useQuery({
		queryKey: ["employees-list"],
		queryFn: () => employeeService.getEmployeeList(),
	});

	const { mutate: createLoan, isPending } = useMutation({
		mutationFn: loanService.createLoan,
		onSuccess: () => {
			toast.success("Loan created successfully!");
			navigate("/dashboard/loan", { replace: true });
		},
		onError: () => {
			toast.error("Failed to create loan");
		},
	});

	const confirm = () => {
		const selectedBorrowerId = borrowerType === "customer" ? borrowerId : employeeId;
		if (!selectedBorrowerId) {
			toast.error("Please select a valid borrower");
			return;
		}
		const parsedMonthlyAmount = Number(monthlyAmount);
		if (!Number.isFinite(parsedMonthlyAmount) || parsedMonthlyAmount <= 0) {
			toast.error("Monthly amount must be greater than 0");
			return;
		}
		const parsedDepositAmount = Number(depositAmount);
		const principalAmount = depositAmount.trim() === "" || Number.isNaN(parsedDepositAmount) ? 0 : parsedDepositAmount;
		if (principalAmount <= 0) {
			toast.error("Principal amount must be greater than 0");
			return;
		}

		createLoan({
			borrowerType,
			borrowerId: selectedBorrowerId,
			principalAmount,
			loanInstallmentAmount: parsedMonthlyAmount,
			startDate: toUtcIsoPreferNowIfToday(dueDate) ?? dueDate.toISOString(),
		});
	};

	return {
		borrowerType,
		setBorrowerType,
		borrowerId,
		setBorrowerId,
		employeeId,
		setEmployeeId,
		monthlyAmount,
		setMonthlyAmount,
		depositAmount,
		setDepositAmount,
		dueDate,
		setDueDate,
		confirm,
		isPending,
		customers,
		employees,
	};
}
