import { FormProvider } from "react-hook-form";
import { useBorrowPaymentForm } from "../hooks/use-borrow-payment-form";
import { BorrowPaymentBorrowerInfo } from "./borrow-payment-borrower-info";
import { BorrowPaymentLayout } from "./borrow-payment-layout";
import { BorrowPaymentRightPanel } from "./borrow-payment-right-panel";

export function BorrowPaymentView() {
	const { form, isGeneratingCode, regenerateLoanCode, confirm, isPending, customers, employees } =
		useBorrowPaymentForm();

	return (
		<FormProvider {...form}>
			<BorrowPaymentLayout>
				<div className="rounded-lg border bg-white p-6 shadow-sm">
					<form onSubmit={form.handleSubmit(confirm)} className="flex flex-1 flex-col gap-8">
						<BorrowPaymentBorrowerInfo form={form} customers={customers} employees={employees} />
						<BorrowPaymentRightPanel
							form={form}
							isGeneratingCode={isGeneratingCode}
							regenerateLoanCode={regenerateLoanCode}
							isPending={isPending}
						/>
					</form>
				</div>
			</BorrowPaymentLayout>
		</FormProvider>
	);
}
