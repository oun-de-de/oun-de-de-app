import { Check, Loader2, RefreshCw } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Textarea } from "@/core/ui/textarea";
import { FormDatePicker } from "../../../accounting/components/form-date-picker";
import type { BorrowPaymentFormValues } from "../hooks/use-borrow-payment-form";

interface BorrowPaymentRightPanelProps {
	form: UseFormReturn<BorrowPaymentFormValues>;
	isGeneratingCode: boolean;
	regenerateLoanCode: () => void;
	isPending: boolean;
}

export function BorrowPaymentRightPanel({
	form,
	isGeneratingCode,
	regenerateLoanCode,
	isPending,
}: BorrowPaymentRightPanelProps) {
	const {
		register,
		formState: { errors },
	} = form;

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1">
				<div className="space-y-5">
					<div className="space-y-2">
						<Label className="w-24 lg:w-32 shrink-0 text-[13px] font-medium text-gray-500">
							<span className="text-rose-500">*</span>Loan Code
						</Label>
						<div className="relative group">
							<Input
								type="text"
								{...register("loanCode")}
								className="h-12 pr-12 font-bold text-lg border-slate-200 focus:border-blue-500 rounded-lg bg-slate-50/50"
								placeholder="Auto-generated"
								disabled={isGeneratingCode}
							/>
							<button
								type="button"
								onClick={() => regenerateLoanCode()}
								disabled={isGeneratingCode}
								className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
								title="Generate new code"
							>
								{isGeneratingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
							</button>
						</div>
						{errors.loanCode && <p className="text-[12px] text-rose-500 font-medium">{errors.loanCode.message}</p>}
					</div>

					<div className="space-y-2">
						<Label className="w-24 lg:w-32 shrink-0 text-[13px] font-medium text-gray-500">
							<span className="text-rose-500">*</span>Principal Amount
						</Label>
						<div className="relative group">
							<span className="absolute left-3.5 top-3.5 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors pointer-events-none">
								៛
							</span>
							<Input
								type="number"
								{...register("depositAmount")}
								className="h-12 pl-8 font-bold text-lg border-slate-200 focus:border-blue-500 rounded-lg bg-slate-50/50"
								placeholder="0.00"
							/>
						</div>
						{errors.depositAmount && (
							<p className="text-[12px] text-rose-500 font-medium">{errors.depositAmount.message}</p>
						)}
					</div>

					<div className="flex w-full gap-4">
						<div className="flex-[1.3] space-y-2">
							<Label className="font-medium text-gray-500">
								<span className="text-rose-500">*</span>Monthly Amount (៛)
							</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">
									៛
								</span>
								<Input
									type="number"
									min={1}
									{...register("monthlyAmount")}
									className="h-11 pl-7 border-slate-200 font-medium rounded-lg bg-slate-50/50"
									placeholder="0"
								/>
							</div>
							{errors.monthlyAmount && (
								<p className="text-[12px] text-rose-500 font-medium">{errors.monthlyAmount.message}</p>
							)}
						</div>
						<div className="flex-1 space-y-2">
							<Label className="font-medium text-gray-500">Due Warning Days</Label>
							<Input
								type="number"
								min={0}
								{...register("dueWarningDays")}
								className="h-11 border-slate-200 font-medium rounded-lg bg-slate-50/50"
								placeholder="7"
							/>
							{errors.dueWarningDays && (
								<p className="text-[12px] text-rose-500 font-medium">{errors.dueWarningDays.message}</p>
							)}
						</div>

						<div className="flex-[1.6] space-y-2">
							<Label className="font-medium text-gray-500">Start Date</Label>
							<FormDatePicker control={form.control} name="dueDate" error={errors.dueDate?.message} />
						</div>
					</div>

					<div className="space-y-2">
						<Label className="font-medium text-gray-500">Memo</Label>
						<Textarea
							{...register("memo")}
							rows={4}
							className="min-h-24 border-slate-200 rounded-lg bg-slate-50/50"
							placeholder="Add note for this loan"
						/>
						{errors.memo && <p className="text-[12px] text-rose-500 font-medium">{errors.memo.message}</p>}
					</div>
				</div>
			</div>

			<div className="pt-8 mt-auto">
				<Button
					disabled={isPending}
					type="submit"
					className="w-full h-12 text-sm font-bold uppercase tracking-wide shadow-lg shadow-blue-600/20 rounded-xl transition-all"
				>
					{isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
					{isPending ? "Creating Loan..." : "Confirm & Create Loan"}
				</Button>
			</div>
		</div>
	);
}
