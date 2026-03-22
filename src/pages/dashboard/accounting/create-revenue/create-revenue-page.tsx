import { BackButton } from "@/core/components/common";
import { toast } from "sonner";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { formatNumber } from "@/core/utils/formatters";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import type { CreateCashTransactionRequest } from "@/core/types/cash-transaction";
import { ACCOUNTING_DRAFT_FORM_TEXT, ACCOUNTING_FORM_TRANSACTION_TYPES } from "../constants";
import { AccountingSelectOptionContent } from "../components/accounting-select-option-content";
import { useAccountingReferenceData } from "../hooks/use-accounting-reference-data";
import { createEmptyRevenueLine, type RevenueLine } from "../utils/accounting-line-factories";
import { formatDateTimeLocalInputValue } from "../utils/format-local-date-time";
import { getChartAccountAccountTypeId } from "../utils/map-chart-account-result";
import { useCreateCashTransaction } from "@/pages/dashboard/accounting-center/hooks/use-create-cash-transaction";

const getChartAccountLabel = (code?: string, name?: string) => (code && name ? `${code} : ${name}` : "");

type RevenueFormValues = {
	refNo: string;
	date: string;
	cashAccount: string;
	employeeId: string;
	memo: string;
};

export default function CreateRevenuePage() {
	const navigate = useNavigate();
	const { chartAccounts, customerOptions, employeeOptions, isLoading, journalClassOptions } =
		useAccountingReferenceData({
			accountTypesEnabled: false,
			journalTypesEnabled: false,
			customersEnabled: true,
			loadChartAccountType: true,
		});
	const { mutateAsync: createCashTransaction, isPending: isSubmitting } = useCreateCashTransaction();
	const form = useForm<RevenueFormValues>({
		defaultValues: {
			refNo: "REVXXXXXXXXXX",
			date: formatDateTimeLocalInputValue(),
			cashAccount: "",
			employeeId: "",
			memo: "",
		},
	});
	const [lines, setLines] = useState<RevenueLine[]>([createEmptyRevenueLine(0)]);
	const refNo = form.watch("refNo");
	const date = form.watch("date");
	const cashAccount = form.watch("cashAccount");
	const employeeId = form.watch("employeeId");
	const memo = form.watch("memo");

	const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0), [lines]);
	const selectedCashAccountLabel = useMemo(() => {
		const selectedAccount = chartAccounts.find((account) => account.id === cashAccount);
		return getChartAccountLabel(selectedAccount?.code, selectedAccount?.name);
	}, [chartAccounts, cashAccount]);
	const chartAccountMap = useMemo(
		() => new Map(chartAccounts.map((account) => [account.id, account])),
		[chartAccounts],
	);

	const updateLine = <K extends keyof RevenueLine>(id: string, field: K, value: RevenueLine[K]) => {
		setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
	};

	const addLine = () => {
		setLines((prev) => [...prev, createEmptyRevenueLine(prev.length)]);
	};

	const removeLine = (id: string) => {
		setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
	};

	const resetForm = () => {
		form.reset({
			refNo: "REVXXXXXXXXXX",
			date: formatDateTimeLocalInputValue(),
			cashAccount: "",
			employeeId: "",
			memo: "",
		});
		setLines([createEmptyRevenueLine(0)]);
	};

	const buildPayload = (values: RevenueFormValues): CreateCashTransactionRequest | null => {
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
			if (!line.accountCode) {
				toast.error(`Line ${index + 1}: account is required`);
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

			const lineChartAccount = chartAccountMap.get(line.accountCode);
			const accountTypeId = lineChartAccount ? getChartAccountAccountTypeId(lineChartAccount) : "";
			if (!accountTypeId) {
				toast.error(`Line ${index + 1}: account type could not be resolved`);
				return null;
			}

			details.push({
				chartOfAccountId: values.cashAccount,
				accountTypeId,
				memo: line.memo.trim() || undefined,
				amount,
				customerId: line.name,
				journalClassId: line.className || undefined,
			});
		}

		return {
			refNo: values.refNo,
			type: ACCOUNTING_FORM_TRANSACTION_TYPES.revenue.toLowerCase() as Lowercase<
				typeof ACCOUNTING_FORM_TRANSACTION_TYPES.revenue
			>,
			date: new Date(values.date).toISOString(),
			employeeId: values.employeeId,
			memo: values.memo.trim() || undefined,
			cashTransactionDetails: details,
		};
	};

	const submitRevenue = async (mode: "close" | "new") => {
		const payload = buildPayload(form.getValues());
		if (!payload) return;

		try {
			await createCashTransaction(payload);
			toast.success(ACCOUNTING_DRAFT_FORM_TEXT.revenue.successMessage);
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
					<span className="text-base font-semibold">{ACCOUNTING_DRAFT_FORM_TEXT.revenue.pageTitle}</span>
				</div>
			</div>

			<Card className="gap-0 py-0">
				<CardHeader className="justify-start border-b px-4 py-3">
					<CardTitle className="text-left text-base font-semibold text-slate-700">
						{ACCOUNTING_DRAFT_FORM_TEXT.revenue.cardTitle}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 px-4 py-4">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
						<div className="space-y-3">
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Ref No
								</Label>
								<div className="w-full">
									<Input value={refNo} disabled />
								</div>
							</div>
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Date
								</Label>
								<div className="relative">
									<CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
									<Input
										type="datetime-local"
										value={date}
										onChange={(event) => form.setValue("date", event.target.value)}
										className="pl-9"
									/>
								</div>
							</div>
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
											<SelectItem key={account.id} value={account.id} className="relative pr-40">
												<AccountingSelectOptionContent
													primary={getChartAccountLabel(account.code, account.name)}
													secondary={account.accountType?.nature ?? "-"}
													rightPaddingClassName="pr-32"
												/>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-3">
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
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Memo
								</Label>
								<Textarea
									value={memo}
									onChange={(event) => form.setValue("memo", event.target.value)}
									className="min-h-24"
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
									{lines.map((line, index) => {
										const selectedLineAccount = chartAccountMap.get(line.accountCode);

										return (
											<tr key={line.id} className="border-b align-top">
												<td className="px-3 py-2">
													<div className="flex h-7 w-7 items-center justify-center rounded bg-sky-50 text-sky-600">
														{index + 1}
													</div>
												</td>
												<td className="min-w-[240px] px-3 py-2">
													<Select
														value={line.accountCode}
														onValueChange={(value) => updateLine(line.id, "accountCode", value)}
													>
														<SelectTrigger disabled={isLoading}>
															{selectedLineAccount ? (
																getChartAccountLabel(selectedLineAccount.code, selectedLineAccount.name)
															) : (
																<SelectValue placeholder="Select account" />
															)}
														</SelectTrigger>
														<SelectContent>
															{chartAccounts.map((account) => (
																<SelectItem key={account.id} value={account.id} className="relative pr-40">
																	<AccountingSelectOptionContent
																		primary={getChartAccountLabel(account.code, account.name)}
																		secondary={account.accountType?.name ?? account.accountType?.nature ?? "-"}
																		rightPaddingClassName="pr-32"
																	/>
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</td>
												<td className="min-w-[180px] px-3 py-2">
													<Input
														value={line.memo}
														onChange={(event) => updateLine(line.id, "memo", event.target.value)}
														placeholder="Memo"
													/>
												</td>
												<td className="min-w-[140px] px-3 py-2">
													<Input
														value={line.amount}
														onChange={(event) =>
															updateLine(line.id, "amount", event.target.value.replace(/[^\d.]/g, ""))
														}
														placeholder="0"
														className="text-right"
													/>
												</td>
												<td className="min-w-[220px] px-3 py-2">
													<Select value={line.name} onValueChange={(value) => updateLine(line.id, "name", value)}>
														<SelectTrigger>
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
												<td className="min-w-[180px] px-3 py-2">
													<Select
														value={line.className}
														onValueChange={(value) => updateLine(line.id, "className", value)}
													>
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
												</td>
												<td className="px-3 py-2 text-center">
													<Button
														variant="ghost"
														size="icon"
														aria-label="Remove revenue line"
														onClick={() => removeLine(line.id)}
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
							<Button variant="info" size="sm" className="gap-2" onClick={addLine}>
								<Plus className="size-4" />
								New
							</Button>
							<div className="flex min-w-[280px] items-center justify-between rounded border bg-white px-4 py-3">
								<span className="text-base font-semibold text-slate-700">Total:</span>
								<span className="text-lg font-semibold text-slate-900">{formatNumber(totalAmount)}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<Button variant="outline" onClick={() => navigate("/dashboard/accounting")}>
							Cancel
						</Button>
						<Button variant="info" onClick={() => void submitRevenue("close")} disabled={isSubmitting}>
							{ACCOUNTING_DRAFT_FORM_TEXT.revenue.saveAndClose}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
