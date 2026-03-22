import { BackButton, SplitButton } from "@/core/components/common";
import { toast } from "sonner";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { formatNumber } from "@/core/utils/formatters";
import { CalendarDays, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import type { CreateCashTransactionRequest } from "@/core/types/cash-transaction";
import { ACCOUNTING_DRAFT_FORM_TEXT, ACCOUNTING_FORM_TRANSACTION_TYPES } from "../constants";
import { AccountingSelectOptionContent } from "../components/accounting-select-option-content";
import { AccountingCreateMenuButton } from "../components/accounting-create-menu-button";
import { useAccountingReferenceData } from "../hooks/use-accounting-reference-data";
import { useGetCurrencyList } from "@/pages/dashboard/settings/hooks/use-settings";
import { createEmptyExpenseLine, type ExpenseLine } from "../utils/accounting-line-factories";
import { formatDateTimeLocalInputValue } from "../utils/format-local-date-time";
import { useCreateCashTransaction } from "@/pages/dashboard/accounting-center/hooks/use-create-cash-transaction";

const getChartAccountLabel = (code?: string, name?: string) => (code && name ? `${code} : ${name}` : "");

type ExpenseFormValues = {
	refNo: string;
	date: string;
	currencyId: string;
	cashAccount: string;
	employeeId: string;
	memo: string;
};

export default function CreateExpensePage() {
	const navigate = useNavigate();
	const { accountTypes, chartAccounts, customerOptions, employeeOptions, isLoading, journalClassOptions } =
		useAccountingReferenceData({
			accountTypesEnabled: true,
			journalTypesEnabled: false,
			customersEnabled: true,
			loadChartAccountType: true,
		});
	const { data: currencies = [], isLoading: isLoadingCurrencies } = useGetCurrencyList();
	const { mutateAsync: createCashTransaction, isPending: isSubmitting } = useCreateCashTransaction();
	const form = useForm<ExpenseFormValues>({
		defaultValues: {
			refNo: "EXPXXXXXXXXXX",
			date: formatDateTimeLocalInputValue(),
			currencyId: "",
			cashAccount: "",
			employeeId: "",
			memo: "",
		},
	});
	const [lines, setLines] = useState<ExpenseLine[]>([createEmptyExpenseLine(0)]);
	const refNo = form.watch("refNo");
	const date = form.watch("date");
	const currencyId = form.watch("currencyId");
	const cashAccount = form.watch("cashAccount");
	const employeeId = form.watch("employeeId");
	const memo = form.watch("memo");

	const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0), [lines]);
	const currencyOptions = useMemo(() => currencies.map((item) => ({ value: item.id, label: item.name })), [currencies]);
	const selectedCashAccountLabel = useMemo(() => {
		const selectedAccount = chartAccounts.find((account) => account.id === cashAccount);
		return getChartAccountLabel(selectedAccount?.code, selectedAccount?.name);
	}, [chartAccounts, cashAccount]);
	const defaultCurrencyId = currencies[1]?.id ?? currencies[0]?.id ?? "";

	useEffect(() => {
		if (!currencyId && defaultCurrencyId) {
			form.setValue("currencyId", defaultCurrencyId);
		}
	}, [defaultCurrencyId, currencyId, form]);

	const updateLine = <K extends keyof ExpenseLine>(id: string, field: K, value: ExpenseLine[K]) => {
		setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
	};

	const updateAccountType = (id: string, accountTypeId: string) => {
		updateLine(id, "accountTypeId", accountTypeId);
	};

	const addLine = () => {
		setLines((prev) => [...prev, createEmptyExpenseLine(prev.length)]);
	};

	const removeLine = (id: string) => {
		setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
	};

	const resetForm = () => {
		form.reset({
			refNo: "EXPXXXXXXXXXX",
			date: formatDateTimeLocalInputValue(),
			currencyId: defaultCurrencyId,
			cashAccount: "",
			employeeId: "",
			memo: "",
		});
		setLines([createEmptyExpenseLine(0)]);
	};

	const buildPayload = (values: ExpenseFormValues): CreateCashTransactionRequest | null => {
		if (!values.refNo.trim()) {
			toast.error("Ref No is required");
			return null;
		}

		if (!values.cashAccount) {
			toast.error("Chart of Account is required");
			return null;
		}

		if (!values.employeeId) {
			toast.error("Employee is required");
			return null;
		}

		const details: CreateCashTransactionRequest["cashTransactionDetails"] = [];

		for (const [index, line] of lines.entries()) {
			if (!line.accountTypeId) {
				toast.error(`Line ${index + 1}: account type is required`);
				return null;
			}

			if (!line.name) {
				toast.error(`Line ${index + 1}: customer name is required`);
				return null;
			}

			const amount = Number(line.amount);
			if (!Number.isFinite(amount) || amount <= 0) {
				toast.error(`Line ${index + 1}: amount must be greater than 0`);
				return null;
			}

			details.push({
				chartOfAccountId: values.cashAccount,
				accountTypeId: line.accountTypeId,
				memo: line.memo.trim() || undefined,
				amount,
				customerId: line.name,
				journalClassId: line.className || undefined,
			});
		}

		return {
			refNo: values.refNo.trim(),
			type: ACCOUNTING_FORM_TRANSACTION_TYPES.expense.toLowerCase() as Lowercase<
				typeof ACCOUNTING_FORM_TRANSACTION_TYPES.expense
			>,
			date: new Date(values.date).toISOString(),
			currencyId: values.currencyId || undefined,
			employeeId: values.employeeId,
			memo: values.memo.trim() || undefined,
			cashTransactionDetails: details,
		};
	};

	const submitExpense = async (mode: "close" | "new") => {
		const payload = buildPayload(form.getValues());
		if (!payload) return;

		try {
			await createCashTransaction(payload);
			toast.success(ACCOUNTING_DRAFT_FORM_TEXT.expense.successMessage);
			if (mode === "close") {
				navigate("/dashboard/accounting");
				return;
			}
			resetForm();
		} catch {
			// Error toast is handled by the network layer.
		}
	};

	return (
		<div className="flex h-full flex-col gap-4 p-3 md:p-4">
			<div className="flex items-center gap-3 pb-2">
				<BackButton onClick={() => navigate("/dashboard/accounting")} />
				<div className="flex items-center gap-2 text-slate-700">
					<span className="text-base font-semibold">{ACCOUNTING_DRAFT_FORM_TEXT.expense.pageTitle}</span>
				</div>
			</div>

			<Card className="gap-0 py-0">
				<CardHeader className="justify-start border-b px-4 py-3">
					<CardTitle className="text-left text-base font-semibold text-slate-700">
						{ACCOUNTING_DRAFT_FORM_TEXT.expense.cardTitle}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 px-4 py-4">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
						<div className="space-y-3">
							<div className="space-y-1.5">
								<Label htmlFor="expense-ref-no" className="text-slate-600">
									<span className="text-rose-500">*</span> Ref No
								</Label>
								<div className="w-full">
									<Input
										id="expense-ref-no"
										value={refNo}
										onChange={(event) => form.setValue("refNo", event.target.value)}
										className="rounded-l-none"
									/>
								</div>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="expense-date" className="text-slate-600">
									<span className="text-rose-500">*</span> Date
								</Label>
								<div className="relative">
									<CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
									<Input
										id="expense-date"
										type="datetime-local"
										value={date}
										onChange={(event) => form.setValue("date", event.target.value)}
										className="pl-9"
									/>
								</div>
							</div>
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Currency
								</Label>
								<Select value={currencyId} onValueChange={(value) => form.setValue("currencyId", value)}>
									<SelectTrigger disabled={isLoadingCurrencies}>
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
							</div>
						</div>

						<div className="space-y-3">
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Cash & Cash Equivalents
								</Label>
								<Select value={cashAccount} onValueChange={(value) => form.setValue("cashAccount", value)}>
									<SelectTrigger disabled={isLoading}>
										{selectedCashAccountLabel || <SelectValue placeholder="Select" />}
									</SelectTrigger>
									<SelectContent>
										{chartAccounts.map((account) => (
											<SelectItem key={account.id} value={account.id} className="relative pr-32">
												<AccountingSelectOptionContent
													primary={getChartAccountLabel(account.code, account.name)}
													secondary={account.accountType?.nature ?? "-"}
												/>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Employee
								</Label>
								<Select value={employeeId} onValueChange={(value) => form.setValue("employeeId", value)}>
									<SelectTrigger disabled={isLoading}>
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
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="expense-memo" className="text-slate-600">
									<span className="text-rose-500">*</span> Memo
								</Label>
								<Textarea
									id="expense-memo"
									value={memo}
									onChange={(event) => form.setValue("memo", event.target.value)}
									placeholder="Enter expense note"
									className="min-h-20"
								/>
							</div>
						</div>
					</div>

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
									{lines.map((line, index) => (
										<tr key={line.id} className="border-b align-top">
											<td className="px-3 py-2">
												<div className="flex h-9 w-9 items-center justify-center rounded bg-sky-50 text-sky-600">
													{index + 1}
												</div>
											</td>
											<td className="px-3 py-2 min-w-[260px]">
												<Select value={line.accountTypeId} onValueChange={(value) => updateAccountType(line.id, value)}>
													<SelectTrigger disabled={isLoading} className={index === 0 ? "border-sky-400" : undefined}>
														{accountTypes.find((accountType) => accountType.id === line.accountTypeId)?.name || (
															<SelectValue placeholder="Select account" />
														)}
													</SelectTrigger>
													<SelectContent>
														{accountTypes.map((accountType) => (
															<SelectItem key={accountType.id} value={accountType.id} className="relative pr-28">
																<AccountingSelectOptionContent
																	primary={accountType.name}
																	secondary={accountType.nature}
																	rightPaddingClassName="pr-20"
																/>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</td>
											<td className="px-3 py-2 min-w-[180px]">
												<Input
													value={line.memo}
													onChange={(event) => updateLine(line.id, "memo", event.target.value)}
													placeholder="Memo"
												/>
											</td>
											<td className="px-3 py-2 min-w-[160px]">
												<Input
													value={line.amount}
													onChange={(event) => updateLine(line.id, "amount", event.target.value.replace(/[^\d.]/g, ""))}
													placeholder="0"
													className="text-right"
												/>
											</td>
											<td className="px-3 py-2 min-w-[220px]">
												<Select value={line.name} onValueChange={(value) => updateLine(line.id, "name", value)}>
													<SelectTrigger disabled={isLoading}>
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
											</td>
											<td className="px-3 py-2 min-w-[160px]">
												<Select
													value={line.className}
													onValueChange={(value) => updateLine(line.id, "className", value)}
												>
													<SelectTrigger disabled={isLoading}>
														<SelectValue placeholder="Select class" />
													</SelectTrigger>
													<SelectContent>
														{journalClassOptions.map((option) => (
															<SelectItem key={option.value} value={option.value}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</td>
											<td className="px-3 py-2 text-center">
												<Button
													variant="ghost"
													size="icon"
													aria-label="Remove expense line"
													onClick={() => removeLine(line.id)}
												>
													<Trash2 className="size-4 text-rose-500" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="flex items-center justify-between gap-3 border-t px-4 py-4">
							<AccountingCreateMenuButton
								variant="info"
								size="sm"
								mainAction={{ label: "+ New", onClick: addLine }}
								optionLabels={["Create Expense", "Create Revenue"]}
							/>
							<div className="flex min-w-[260px] items-center justify-between rounded border bg-white px-4 py-3">
								<span className="text-base font-semibold text-slate-700">Total:</span>
								<span className="text-lg font-semibold text-slate-900">$ {formatNumber(totalAmount)}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<Button variant="outline" onClick={() => navigate("/dashboard/accounting")}>
							Cancel
						</Button>
						<SplitButton
							variant="info"
							mainAction={{
								label: ACCOUNTING_DRAFT_FORM_TEXT.expense.saveAndClose,
								onClick: () => void submitExpense("close"),
								disabled: isSubmitting,
							}}
							options={[
								{
									label: ACCOUNTING_DRAFT_FORM_TEXT.expense.saveAndNew,
									onClick: () => void submitExpense("new"),
									disabled: isSubmitting,
								},
							]}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
