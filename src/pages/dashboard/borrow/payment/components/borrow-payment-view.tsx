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
		totalAmount,
		borrowerName,
		setBorrowerName,
		phone,
		setPhone,
		idCard,
		setIdCard,
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
	} = useBorrowPaymentForm();

	return (
		<BorrowPaymentLayout
			header={<BorrowPaymentHeader />}
			rightPanel={
				<BorrowPaymentRightPanel
					totalAmount={totalAmount}
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
				/>
			}
		>
			<BorrowPaymentBorrowerInfo
				borrowerName={borrowerName}
				setBorrowerName={setBorrowerName}
				phone={phone}
				setPhone={setPhone}
				idCard={idCard}
				setIdCard={setIdCard}
			/>

			<div className="px-6 py-2">
				<div className="h-px bg-gray-100 w-full" />
			</div>

			<BorrowPaymentItems cart={cart} onRemove={removeFromCart} />

			<BorrowPaymentSummary cart={cart} totalAmount={totalAmount} />
		</BorrowPaymentLayout>
	);
}
