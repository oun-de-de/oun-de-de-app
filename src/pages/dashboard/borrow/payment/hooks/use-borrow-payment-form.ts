import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import loanService from "@/core/api/services/loan-service";
import { getTodayUTC } from "@/core/utils/date-utils";

export function useBorrowPaymentForm() {
	const navigate = useNavigate();

	const [borrowerId, setBorrowerId] = useState("");
	const [termMonths, setTermMonths] = useState<number>(1);

	const [depositAmount, setDepositAmount] = useState<string>("");
	const [dueDate, setDueDate] = useState(getTodayUTC);

	// Fetch Customers
	const { data: customers = [] } = useQuery({
		queryKey: ["customers-list"],
		queryFn: () => customerService.getCustomerList({ limit: 1000 }).then((res) => res.list),
	});

	const { mutate: createLoan, isPending } = useMutation({
		mutationFn: loanService.createLoan,
		onSuccess: () => {
			toast.success("Loan created successfully!");
			navigate("/dashboard/borrow", { replace: true });
		},
		onError: () => {
			toast.error("Failed to create loan");
		},
	});

	const confirm = () => {
		if (!borrowerId) {
			toast.error("Please select a valid borrower");
			return;
		}
		if (termMonths < 1) {
			toast.error("Term must be at least 1 month");
			return;
		}
		const parsedDepositAmount = Number(depositAmount);
		const principalAmount =
			depositAmount.trim() === "" || Number.isNaN(parsedDepositAmount) ? 0 : parsedDepositAmount;
		if (principalAmount <= 0) {
			toast.error("Principal amount must be greater than 0");
			return;
		}

		createLoan({
			borrowerType: "customer",
			borrowerId,
			principalAmount,
			termMonths,
			startDate: dueDate.toISOString(),
		});
	};

	return {
		borrowerId,
		setBorrowerId,
		termMonths,
		setTermMonths,
		depositAmount,
		setDepositAmount,
		dueDate,
		setDueDate,
		confirm,
		isPending,
		customers,
	};
}
