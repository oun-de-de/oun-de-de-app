import { useBorrowPaymentForm } from "../hooks/use-borrow-payment-form";
import { BorrowPaymentBorrowerInfo } from "./borrow-payment-borrower-info";
import { BorrowPaymentLayout } from "./borrow-payment-layout";
import { BorrowPaymentRightPanel } from "./borrow-payment-right-panel";

export function BorrowPaymentView() {
	const {
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
	} = useBorrowPaymentForm();

	return (
		<BorrowPaymentLayout>
			<div className="rounded-lg border bg-white p-6 shadow-sm">
				<div className="flex flex-1 flex-col gap-8">
					<BorrowPaymentBorrowerInfo borrowerId={borrowerId} setBorrowerId={setBorrowerId} customers={customers} />
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
