import { useBorrowPaymentForm } from "../hooks/use-borrow-payment-form";
import { BorrowPaymentBorrowerInfo } from "./borrow-payment-borrower-info";
import { BorrowPaymentHeader } from "./borrow-payment-header";
import { BorrowPaymentItems } from "./borrow-payment-items";
import { BorrowPaymentLayout } from "./borrow-payment-layout";
import { BorrowPaymentRightPanel } from "./borrow-payment-right-panel";
import { BorrowPaymentSummary } from "./borrow-payment-summary";

export function BorrowPaymentView() {
	const {
		cart,
		removeFromCart,
		totalQty,
		totalAmount,
		borrowerType,
		setBorrowerType,
		borrowerId,
		setBorrowerId,
		termMonths,
		setTermMonths,
		paymentMethod,
		setPaymentMethod,
		depositAmount,
		setDepositAmount,
		dueDate,
		setDueDate,
		notes,
		setNotes,
		refNo,
		setRefNo,
		confirm,
		isPending,
		customers,
		employees,
	} = useBorrowPaymentForm();

	return (
		<BorrowPaymentLayout
			header={<BorrowPaymentHeader />}
			rightPanel={
				<BorrowPaymentRightPanel
					totalQty={totalQty}
					termMonths={termMonths}
					setTermMonths={setTermMonths}
					paymentMethod={paymentMethod}
					setPaymentMethod={setPaymentMethod}
					depositAmount={depositAmount}
					setDepositAmount={setDepositAmount}
					dueDate={dueDate}
					setDueDate={setDueDate}
					refNo={refNo}
					setRefNo={setRefNo}
					notes={notes}
					setNotes={setNotes}
					onConfirm={confirm}
					isPending={isPending}
				/>
			}
		>
			<BorrowPaymentBorrowerInfo
				borrowerType={borrowerType}
				setBorrowerType={setBorrowerType}
				borrowerId={borrowerId}
				setBorrowerId={setBorrowerId}
				customers={customers}
				employees={employees}
			/>

			<div className="px-6 py-2">
				<div className="h-px bg-gray-100 w-full" />
			</div>

			<BorrowPaymentItems cart={cart} onRemove={removeFromCart} />

			<BorrowPaymentSummary cart={cart} totalAmount={totalAmount} />
		</BorrowPaymentLayout>
	);
}
