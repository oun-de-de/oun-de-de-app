import { useBorrowPaymentForm } from "../hooks/use-borrow-payment-form";
import { BorrowPaymentBorrowerInfo } from "./borrow-payment-borrower-info";
import { BorrowPaymentLayout } from "./borrow-payment-layout";
import { BorrowPaymentRightPanel } from "./borrow-payment-right-panel";

export function BorrowPaymentView() {
	const {
		borrowerType,
		setBorrowerType,
		borrowerId,
		setBorrowerId,
		employeeId,
		setEmployeeId,
		termMonths,
		setTermMonths,
		depositAmount,
		setDepositAmount,
		dueDate,
		setDueDate,
		confirm,
		isPending,
		customers,
		employees,
	} = useBorrowPaymentForm();

	return (
		<BorrowPaymentLayout>
			<div className="rounded-lg border bg-white p-6 shadow-sm">
				<div className="flex flex-1 flex-col gap-8">
					<BorrowPaymentBorrowerInfo
						borrowerType={borrowerType}
						setBorrowerType={setBorrowerType}
						borrowerId={borrowerId}
						setBorrowerId={setBorrowerId}
						employeeId={employeeId}
						setEmployeeId={setEmployeeId}
						customers={customers}
						employees={employees}
					/>
					<BorrowPaymentRightPanel
						termMonths={termMonths}
						setTermMonths={setTermMonths}
						depositAmount={depositAmount}
						setDepositAmount={setDepositAmount}
						dueDate={dueDate}
						setDueDate={setDueDate}
						onConfirm={confirm}
						isPending={isPending}
					/>
				</div>
			</div>
		</BorrowPaymentLayout>
	);
}
