import { toast } from "sonner";
import { CalendarDays, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BackButton, SplitButton } from "@/core/components/common";
import type { CashTransactionType, CreateCashTransactionRequest } from "@/core/types/cash-transaction";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { formatNumber } from "@/core/utils/formatters";
import { cn } from "@/core/utils";
import { ACCOUNTING_DRAFT_FORM_TEXT } from "@/pages/dashboard/accounting/constants";
import { AccountingCreateMenuButton } from "@/pages/dashboard/accounting/components/accounting-create-menu-button";
import { useAccountingReferenceData } from "@/pages/dashboard/accounting/hooks/use-accounting-reference-data";
import {
	createEmptyTransactionLine,
	type TransactionLine,
} from "@/pages/dashboard/accounting/utils/accounting-line-factories";
import { formatLocalDateTime } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import { getChartAccountAccountTypeId } from "@/pages/dashboard/accounting/utils/map-chart-account-result";
import { useGetCurrencyList } from "@/pages/dashboard/settings/hooks/use-settings";
import { useCreateCashTransaction } from "../hooks/use-create-cash-transaction";

const CASH_TRANSACTION_TYPE_OPTIONS: { value: CashTransactionType; label: string }[] = [
	{ value: "DEBIT", label: "Debit" },
	{ value: "CREDIT", label: "Credit" },
];

type CashTransactionEntryTab = "from" | "to";
type CashTransactionLineGroup = {
	label: "From" | "To";
	lines: TransactionLine[];
};

function createCashTransactionRefNo(date: Date) {
	const compact = [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0"),
		String(date.getHours()).padStart(2, "0"),
		String(date.getMinutes()).padStart(2, "0"),
		String(date.getSeconds()).padStart(2, "0"),
	].join("");
	return `CT${compact}`;
}

function createInitialFormState() {
	const date = new Date();
	return {
		refNo: createCashTransactionRefNo(date),
		date,
		fromLines: [createEmptyTransactionLine(0)],
		toLines: [createEmptyTransactionLine(0)],
	};
}

function buildLineGroups(fromLines: TransactionLine[], toLines: TransactionLine[]): CashTransactionLineGroup[] {
	return [
		{ label: "From", lines: fromLines },
		{ label: "To", lines: toLines },
	];
}

export default function CreateAccountingEntryPage() {
	const navigate = useNavigate();
	const { chartAccounts, chartAccountOptions, customerOptions, employeeOptions, isLoading, journalClassOptions } =
		useAccountingReferenceData({
			accountTypesEnabled: false,
			journalTypesEnabled: false,
			loadChartAccountType: true,
		});
	const { data: currencies = [], isLoading: isLoadingCurrencies } = useGetCurrencyList();
	const { mutateAsync: createCashTransaction, isPending: isSubmitting } = useCreateCashTransaction();
	const [initialFormState] = useState(createInitialFormState);
	const [refNo, setRefNo] = useState(initialFormState.refNo);
	const [date, setDate] = useState(initialFormState.date);
	const [employeeId, setEmployeeId] = useState("");
	const [transactionType, setTransactionType] = useState<CashTransactionType>("DEBIT");
	const [currencyId, setCurrencyId] = useState("");
	const [activeEntryTab, setActiveEntryTab] = useState<CashTransactionEntryTab>("from");
	const [memo, setMemo] = useState("");
	const [fromLines, setFromLines] = useState<TransactionLine[]>(initialFormState.fromLines);
	const [toLines, setToLines] = useState<TransactionLine[]>(initialFormState.toLines);

	const activeLines = activeEntryTab === "from" ? fromLines : toLines;
	const totalAmount = useMemo(
		() => activeLines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
		[activeLines],
	);
	const displayedDate = useMemo(() => formatLocalDateTime(date), [date]);
	const chartAccountMap = useMemo(() => new Map(chartAccounts.map((item) => [item.id, item])), [chartAccounts]);
	const currencyOptions = useMemo(() => currencies.map((item) => ({ value: item.id, label: item.name })), [currencies]);
	const selectedCurrencyName = useMemo(
		() => currencies.find((item) => item.id === currencyId)?.name ?? "",
		[currencies, currencyId],
	);
	const lineGroups = useMemo(() => buildLineGroups(fromLines, toLines), [fromLines, toLines]);

	useEffect(() => {
		if (!currencyId && currencies.length > 0) {
			setCurrencyId(currencies[0].id);
		}
	}, [currencies, currencyId]);

	const updateActiveLines = (updater: (lines: TransactionLine[]) => TransactionLine[]) => {
		if (activeEntryTab === "from") {
			setFromLines(updater);
			return;
		}
		setToLines(updater);
	};

	const updateLine = <K extends keyof TransactionLine>(id: string, field: K, value: TransactionLine[K]) => {
		updateActiveLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
	};

	const addLine = () => {
		updateActiveLines((prev) => [...prev, createEmptyTransactionLine(prev.length)]);
	};

	const removeLine = (id: string) => {
		updateActiveLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
	};

	const applyFormState = (nextFormState: ReturnType<typeof createInitialFormState>) => {
		setRefNo(nextFormState.refNo);
		setDate(nextFormState.date);
		setFromLines(nextFormState.fromLines);
		setToLines(nextFormState.toLines);
	};

	const resetForm = () => {
		const nextFormState = createInitialFormState();
		applyFormState(nextFormState);
		setEmployeeId("");
		setTransactionType("DEBIT");
		setCurrencyId(currencies[0]?.id ?? "");
		setActiveEntryTab("from");
		setMemo("");
	};

	const buildPayload = (): CreateCashTransactionRequest | null => {
		if (!refNo.trim()) {
			toast.error("Ref No is required");
			return null;
		}

		if (!employeeId) {
			toast.error("Employee is required");
			return null;
		}

		const details: CreateCashTransactionRequest["cashTransactionDetails"] = [];

		for (const group of lineGroups) {
			for (const [index, line] of group.lines.entries()) {
				if (!line.accountCode) {
					toast.error(`${group.label} line ${index + 1}: account is required`);
					return null;
				}

				if (!line.customerId) {
					toast.error(`${group.label} line ${index + 1}: customer is required`);
					return null;
				}

				const amount = Number(line.amount);
				if (!Number.isFinite(amount) || amount <= 0) {
					toast.error(`${group.label} line ${index + 1}: amount must be greater than 0`);
					return null;
				}

				const chartAccount = chartAccountMap.get(line.accountCode);
				const accountTypeId = chartAccount ? getChartAccountAccountTypeId(chartAccount) : "";
				if (!accountTypeId) {
					toast.error(`${group.label} line ${index + 1}: account type could not be resolved`);
					return null;
				}

				details.push({
					chartOfAccountId: line.accountCode,
					accountTypeId,
					memo: line.memo.trim() || undefined,
					amount,
					customerId: line.customerId,
					journalClassId: line.className || undefined,
				});
			}
		}

		return {
			refNo,
			type: transactionType,
			date: date.toISOString(),
			currencyId: currencyId || undefined,
			employeeId,
			memo: memo.trim() || undefined,
			cashTransactionDetails: details,
		};
	};

	const submitTransaction = async (mode: "close" | "new") => {
		const payload = buildPayload();
		if (!payload) return;

		try {
			await createCashTransaction(payload);
			toast.success(ACCOUNTING_DRAFT_FORM_TEXT.transaction.successMessage);
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
				<span className="text-base font-semibold text-slate-700">
					{ACCOUNTING_DRAFT_FORM_TEXT.transaction.pageTitle}
				</span>
			</div>

			<Card>
				<CardHeader className="flex justify-start items-end-safe border-b">
					<CardTitle className="font-semibold text-slate-700 px-2">
						{ACCOUNTING_DRAFT_FORM_TEXT.transaction.cardTitle}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 px-4 py-4">
					<div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
						{ACCOUNTING_DRAFT_FORM_TEXT.transaction.notice}
					</div>
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
						<div className="space-y-4">
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Ref No
								</Label>
								<Input value={refNo} disabled />
							</div>
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Date
								</Label>
								<div className="relative">
									<CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
									<Input value={displayedDate} disabled className="pl-9" />
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Transaction type
								</Label>
								<Select
									value={transactionType}
									onValueChange={(value: CashTransactionType) => setTransactionType(value)}
								>
									<SelectTrigger disabled={isSubmitting}>
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent>
										{CASH_TRANSACTION_TYPE_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label className="text-slate-600">Currency</Label>
								<Select value={currencyId} onValueChange={setCurrencyId}>
									<SelectTrigger disabled={isSubmitting || isLoadingCurrencies}>
										<SelectValue placeholder="Select currency…" />
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
							<div className="space-y-2">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Employee
								</Label>
								<Select value={employeeId} onValueChange={setEmployeeId}>
									<SelectTrigger disabled={isLoading || isSubmitting}>
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
							<div className="space-y-2">
								<Label className="text-slate-600">Memo</Label>
								<Textarea
									value={memo}
									onChange={(event) => setMemo(event.target.value)}
									placeholder="Enter memo"
									className="min-h-24"
									disabled={isSubmitting}
								/>
							</div>
						</div>
					</div>

					<div className="rounded-md border">
						<div className="flex border-b bg-white text-sm font-semibold">
							{(["from", "to"] as const).map((tab, index) => {
								const isActive = activeEntryTab === tab;
								const label = tab === "from" ? "From" : "To";

								return (
									<button
										key={tab}
										type="button"
										onClick={() => setActiveEntryTab(tab)}
										className={cn(
											"px-4 py-3 transition-colors",
											index === 0 && "border-r",
											isActive ? "bg-sky-500 text-white" : "bg-white text-slate-500 hover:text-sky-600",
										)}
									>
										{label}: {selectedCurrencyName || "Currency"}
									</button>
								);
							})}
						</div>
						<div className="border-b bg-white px-4 py-2 text-xs text-slate-500">
							{activeEntryTab === "from"
								? "Editing the source side of this cash transaction."
								: "Editing the destination side of this cash transaction."}
						</div>
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b bg-slate-50 text-left text-slate-600">
										<th className="px-3 py-2 font-medium">No</th>
										<th className="px-3 py-2 font-medium">Account</th>
										<th className="px-3 py-2 font-medium">Memo</th>
										<th className="px-3 py-2 font-medium text-right">Amount</th>
										<th className="px-3 py-2 font-medium">Customer</th>
										<th className="px-3 py-2 font-medium">Class</th>
										<th className="px-3 py-2 font-medium text-center">Action</th>
									</tr>
								</thead>
								<tbody>
									{activeLines.map((line, index) => (
										<tr key={line.id} className="border-b align-top">
											<td className="px-3 py-2">
												<div className="flex h-7 w-7 items-center justify-center rounded bg-sky-50 text-sky-600">
													{index + 1}
												</div>
											</td>
											<td className="px-3 py-2 min-w-[220px]">
												<Select
													value={line.accountCode}
													onValueChange={(value) => updateLine(line.id, "accountCode", value)}
												>
													<SelectTrigger disabled={isLoading || isSubmitting}>
														<SelectValue placeholder="Select account…" />
													</SelectTrigger>
													<SelectContent>
														{chartAccountOptions.map((option) => (
															<SelectItem key={option.value} value={option.value}>
																{option.label}
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
													disabled={isSubmitting}
												/>
											</td>
											<td className="px-3 py-2 min-w-[140px]">
												<Input
													value={line.amount}
													onChange={(event) => updateLine(line.id, "amount", event.target.value.replace(/[^\d.]/g, ""))}
													placeholder="0"
													className="text-right"
													disabled={isSubmitting}
												/>
											</td>
											<td className="px-3 py-2 min-w-[180px]">
												<Select
													value={line.customerId}
													onValueChange={(value) => updateLine(line.id, "customerId", value)}
												>
													<SelectTrigger disabled={isLoading || isSubmitting}>
														<SelectValue placeholder="Select customer…" />
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
											<td className="px-3 py-2 min-w-[180px]">
												<Select
													value={line.className}
													onValueChange={(value) => updateLine(line.id, "className", value)}
												>
													<SelectTrigger disabled={isLoading || isSubmitting}>
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
													aria-label="Remove transaction line"
													onClick={() => removeLine(line.id)}
													disabled={isSubmitting}
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
								optionLabels={["Create Cash Transaction", "Create Journal", "Create Expense"]}
							/>
							<div className="flex min-w-[240px] items-center justify-between rounded-md border bg-white px-4 py-3">
								<span className="text-base font-semibold text-slate-700">
									Total {activeEntryTab === "from" ? "(From)" : "(To)"}:
								</span>
								<span className="text-lg font-semibold text-slate-900">{formatNumber(totalAmount)} ៛</span>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<Button variant="outline" onClick={() => navigate("/dashboard/accounting")} disabled={isSubmitting}>
							Cancel
						</Button>
						<SplitButton
							variant="info"
							mainAction={{
								label: isSubmitting ? "Saving…" : ACCOUNTING_DRAFT_FORM_TEXT.transaction.saveAndClose,
								onClick: () => void submitTransaction("close"),
							}}
							options={[
								{
									label: ACCOUNTING_DRAFT_FORM_TEXT.transaction.saveAndNew,
									onClick: () => void submitTransaction("new"),
								},
							]}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
