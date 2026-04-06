import { Plus, Trash2 } from "lucide-react";
import { Controller, type UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { formatNumber } from "@/core/utils/formatters";
import type { ChartOfAccountResult } from "@/core/types/accounting";
import type { CashTransactionFormValues } from "../utils/accounting-form-utils";
import { generateId } from "../utils/accounting-form-utils";
import { ChartOfAccountSelect } from "./chart-of-account-select";

interface CashTransactionDetailsTableProps {
	form: UseFormReturn<CashTransactionFormValues>;
	chartAccounts: ChartOfAccountResult[];
	customerOptions: { value: string; label: string }[];
	journalClassOptions: { value: string; label: string }[];
	isLoading: boolean;
}

export function CashTransactionDetailsTable({
	form,
	chartAccounts,
	customerOptions,
	journalClassOptions,
	isLoading,
}: CashTransactionDetailsTableProps) {
	const {
		register,
		control,
		watch,
		formState: { errors },
	} = form;

	const { fields, append, remove } = useFieldArray({
		control,
		name: "details",
	});

	const watchedDetails = watch("details");
	const totalAmount = watchedDetails.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

	return (
		<div className="rounded-md border">
			<div className="border-b bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-600">Account Detail</div>
			<div className="overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="border-b bg-slate-50 text-left text-slate-600">
							<th className="px-3 py-2 font-medium">No</th>
							<th className="px-3 py-2 font-medium">Account</th>
							<th className="px-3 py-2 font-medium">Memo</th>
							<th className="px-3 py-2 font-medium text-right">Amount</th>
							<th className="px-3 py-2 font-medium">Name</th>
							<th className="px-3 py-2 font-medium">Class</th>
							<th className="px-3 py-2 font-medium text-center">Action</th>
						</tr>
					</thead>
					<tbody>
						{fields.map((field, index) => {
							return (
								<tr key={field.id} className="border-b align-top">
									<td className="px-3 py-2">
										<div className="flex h-7 w-7 items-center justify-center rounded bg-sky-50 text-sky-600">
											{index + 1}
										</div>
									</td>
									<td className="min-w-[240px] px-3 py-2">
										<ChartOfAccountSelect
											control={control}
											name={`details.${index}.accountCode`}
											accounts={chartAccounts}
											isLoading={isLoading}
											error={errors.details?.[index]?.accountCode?.message}
										/>
									</td>
									<td className="min-w-[180px] px-3 py-2">
										<Input {...register(`details.${index}.memo`)} placeholder="Memo" />
									</td>
									<td className="min-w-[140px] px-3 py-2">
										<Input
											type="number"
											step="any"
											{...register(`details.${index}.amount`)}
											placeholder="0"
											className={
												errors.details?.[index]?.amount
													? "border-rose-500 ring-1 ring-rose-500 text-right"
													: "text-right"
											}
										/>
										{errors.details?.[index]?.amount && (
											<p className="mt-1 text-[10px] text-rose-500">{errors.details[index].amount.message}</p>
										)}
									</td>
									<td className="min-w-[220px] px-3 py-2">
										<Controller
											control={control}
											name={`details.${index}.customerId`}
											render={({ field: selectField }) => (
												<Select value={selectField.value} onValueChange={selectField.onChange}>
													<SelectTrigger
														className={
															errors.details?.[index]?.customerId ? "border-rose-500 ring-1 ring-rose-500" : undefined
														}
													>
														<SelectValue placeholder="Select customer" />
													</SelectTrigger>
													<SelectContent>
														{customerOptions.map((option) => (
															<SelectItem key={option.value} value={option.value}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
										/>
										{errors.details?.[index]?.customerId && (
											<p className="mt-1 text-[10px] text-rose-500">{errors.details[index].customerId.message}</p>
										)}
									</td>
									<td className="min-w-[180px] px-3 py-2">
										<Controller
											control={control}
											name={`details.${index}.className`}
											render={({ field: selectField }) => (
												<Select value={selectField.value} onValueChange={selectField.onChange}>
													<SelectTrigger disabled={isLoading}>
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent>
														{journalClassOptions.map((option) => (
															<SelectItem key={option.value} value={option.value}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
										/>
									</td>
									<td className="px-3 py-2 text-center">
										<Button
											variant="ghost"
											size="icon"
											aria-label="Remove transaction line"
											onClick={() => remove(index)}
											disabled={fields.length === 1}
										>
											<Trash2 className="size-4 text-rose-500" />
										</Button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between border-t px-4 py-4">
				<Button
					variant="info"
					size="sm"
					className="gap-2"
					onClick={() =>
						append({
							id: generateId(),
							accountCode: "",
							memo: "",
							amount: 0,
							customerId: "",
							className: "",
						})
					}
				>
					<Plus className="size-4" />
					New
				</Button>
				<div className="flex min-w-[280px] items-center justify-between rounded border bg-white px-4 py-3">
					<span className="text-base font-semibold text-slate-700">Total:</span>
					<span className="text-lg font-semibold text-slate-900">{formatNumber(totalAmount)}</span>
				</div>
			</div>
		</div>
	);
}
