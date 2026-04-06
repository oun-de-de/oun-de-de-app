import { RefreshCw } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import type { CashTransactionFormValues } from "../utils/accounting-form-utils";
import { generateRefNo } from "../utils/accounting-form-utils";
import { FormDateTimeLocalPicker } from "./form-date-time-local-picker";

interface CashTransactionFormHeaderProps {
	form: UseFormReturn<CashTransactionFormValues>;
	employeeOptions: { value: string; label: string }[];
	currencyOptions: { value: string; label: string }[];
	isLoadingEmployees: boolean;
	isLoadingCurrencies: boolean;
	type: "REV" | "EXP";
}

export function CashTransactionFormHeader({
	form,
	employeeOptions,
	currencyOptions,
	isLoadingEmployees,
	isLoadingCurrencies,
	type,
}: CashTransactionFormHeaderProps) {
	const {
		register,
		control,
		setValue,
		formState: { errors },
	} = form;

	const refreshRefNo = () => {
		setValue("refNo", generateRefNo(type), { shouldValidate: true });
	};

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
			<div className="space-y-3">
				<div className="space-y-1.5">
					<Label htmlFor="transaction-ref-no" className="text-slate-600">
						<span className="text-rose-500">*</span> Ref No
					</Label>
					<div className="group relative">
						<Input
							id="transaction-ref-no"
							autoComplete="off"
							{...register("refNo")}
							aria-invalid={!!errors.refNo}
							className="pr-10"
						/>
						<button
							type="button"
							onClick={refreshRefNo}
							className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-500"
							title="Refresh Reference Number"
						>
							<RefreshCw className="h-3.5 w-3.5" />
						</button>
					</div>
					{errors.refNo && <p className="text-xs text-rose-500">{errors.refNo.message}</p>}
				</div>
				<div className="space-y-1.5">
					<Label className="text-slate-600">
						<span className="text-rose-500">*</span> Date
					</Label>
					<FormDateTimeLocalPicker control={control} name="date" error={errors.date?.message} />
				</div>
				<div className="space-y-1.5">
					<Label className="text-slate-600">
						<span className="text-rose-500">*</span> Currency
					</Label>
					<Controller
						control={control}
						name="currencyId"
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger disabled={isLoadingCurrencies} aria-invalid={!!errors.currencyId}>
									<SelectValue placeholder="Select currency" />
								</SelectTrigger>
								<SelectContent>
									{currencyOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					{errors.currencyId && <p className="text-xs text-rose-500">{errors.currencyId.message}</p>}
				</div>
			</div>

			<div className="space-y-3">
				<div className="space-y-1.5">
					<Label className="text-slate-600">
						<span className="text-rose-500">*</span> Employee
					</Label>
					<Controller
						control={control}
						name="employeeId"
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger disabled={isLoadingEmployees} aria-invalid={!!errors.employeeId}>
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									{employeeOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					{errors.employeeId && <p className="text-xs text-rose-500">{errors.employeeId.message}</p>}
				</div>
				<div className="space-y-1.5">
					<Label className="text-slate-600">Memo</Label>
					<Textarea autoComplete="off" {...register("memo")} className="min-h-24" />
					{errors.memo && <p className="text-xs text-rose-500">{errors.memo.message}</p>}
				</div>
			</div>
		</div>
	);
}
