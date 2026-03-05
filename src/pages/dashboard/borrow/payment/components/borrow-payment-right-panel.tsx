import { Check, Loader2 } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { formatDateToYYYYMMDD } from "@/core/utils/date-utils";

interface BorrowPaymentRightPanelProps {
	monthlyAmount: string;
	setMonthlyAmount: (value: string) => void;
	depositAmount: string;
	setDepositAmount: (value: string) => void;
	dueDate: Date;
	setDueDate: (value: Date) => void;
	onConfirm: () => void;
	isPending: boolean;
}

export function BorrowPaymentRightPanel({
	monthlyAmount,
	setMonthlyAmount,
	depositAmount,
	setDepositAmount,
	dueDate,
	setDueDate,
	onConfirm,
	isPending,
}: BorrowPaymentRightPanelProps) {
	return (
		<div className="h-full flex flex-col">
			<div className="flex-1">
				<div className="space-y-5">
					<div className="space-y-2">
						<Label className="w-24 lg:w-32 shrink-0 text-[13px] font-medium text-gray-500">
							<span className="text-rose-500">*</span>Deposit Amount
						</Label>
						<div className="relative group">
							<span className="absolute left-3.5 top-3.5 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors pointer-events-none">
								៛
							</span>
							<Input
								type="number"
								value={depositAmount}
								onChange={(e) => setDepositAmount(e.target.value)}
								className="h-12 pl-8 font-bold text-lg border-slate-200 focus:border-blue-500 rounded-lg bg-slate-50/50"
								placeholder="0.00"
							/>
						</div>
					</div>

					<div className="flex gap-4 w-full">
						<div className="space-y-2 flex-[1.5]">
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
									value={monthlyAmount}
									onChange={(e) => setMonthlyAmount(e.target.value)}
									className="h-11 pl-7 border-slate-200 font-medium rounded-lg bg-slate-50/50"
									placeholder="0"
								/>
							</div>
						</div>
						<div className="space-y-2 flex-[2]">
							<Label className="font-medium text-gray-500">Start Date</Label>
							<Input
								type="date"
								value={formatDateToYYYYMMDD(dueDate)}
								onChange={(e) => {
									if (!e.target.value) return;
									setDueDate(new Date(`${e.target.value}T00:00:00.000Z`));
								}}
								className="h-11 border-slate-200 font-medium rounded-lg bg-slate-50/50"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="pt-8 mt-auto">
				<Button
					disabled={isPending}
					className="w-full h-12 text-sm font-bold uppercase tracking-wide bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 rounded-xl transition-all"
					onClick={onConfirm}
				>
					{isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
					{isPending ? "Creating Loan..." : "Confirm & Create Loan"}
				</Button>
			</div>
		</div>
	);
}
