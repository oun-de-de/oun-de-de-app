import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { BackButton, SplitButton } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { ACCOUNTING_UI_TEXT } from "../constants";
import { useCreateChartAccount } from "../hooks/use-create-chart-account";
import { useAccountingReferenceData } from "../hooks/use-accounting-reference-data";
import { getChartAccountAccountTypeId } from "../utils/map-chart-account-result";

type ChartAccountFormPageProps = {
	mode: "create" | "edit";
};

export function ChartAccountFormPage({ mode }: ChartAccountFormPageProps) {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { accountTypeOptions, chartAccounts, isLoading } = useAccountingReferenceData({
		journalTypesEnabled: false,
		journalClassesEnabled: false,
		employeesEnabled: false,
		customersEnabled: false,
		chartAccountsEnabled: mode === "edit",
		loadChartAccountType: mode === "edit",
	});
	const { mutateAsync: createChartAccount, isPending: isCreating } = useCreateChartAccount();
	const selectedAccount = useMemo(
		() => (mode === "edit" && id ? chartAccounts.find((account) => account.id === id) : undefined),
		[chartAccounts, id, mode],
	);
	const [accountTypeId, setAccountTypeId] = useState("");
	const [accountCode, setAccountCode] = useState("");
	const [accountName, setAccountName] = useState("");
	const [memo, setMemo] = useState("");

	useEffect(() => {
		if (mode !== "edit" || !selectedAccount) return;

		setAccountCode(selectedAccount.code);
		setAccountName(selectedAccount.name);
		setAccountTypeId(getChartAccountAccountTypeId(selectedAccount));
		setMemo(selectedAccount.descr ?? "");
	}, [mode, selectedAccount]);

	useEffect(() => {
		if (mode !== "create" || accountTypeId || accountTypeOptions.length === 0) return;
		setAccountTypeId(accountTypeOptions[0].value);
	}, [accountTypeId, accountTypeOptions, mode]);

	const isEdit = mode === "edit";
	const isReadOnly = isEdit;
	const normalizedAccountTypeId = accountTypeId.trim();
	const isFormValid = normalizedAccountTypeId !== "" && accountCode.trim() !== "" && accountName.trim() !== "";

	const [errors, setErrors] = useState<{ accountType?: string; code?: string; name?: string }>({});

	const handleSave = async () => {
		if (!isFormValid) {
			setErrors({
				accountType: normalizedAccountTypeId === "" ? "Account type is required" : undefined,
				code: accountCode.trim() === "" ? "Account code is required" : undefined,
				name: accountName.trim() === "" ? "Account name is required" : undefined,
			});
			return;
		}

		setErrors({});

		try {
			await createChartAccount({
				accountTypeId: normalizedAccountTypeId,
				code: accountCode.trim(),
				name: accountName.trim(),
				descr: memo.trim() || undefined,
			});
			toast.success(ACCOUNTING_UI_TEXT.createSuccess);
			navigate("/dashboard/accounting");
		} catch {
			toast.error(ACCOUNTING_UI_TEXT.createError);
		}
	};

	return (
		<div className="flex h-full flex-col gap-4 p-3 md:p-4">
			<div className="flex items-center gap-3 pb-2">
				<BackButton onClick={() => navigate("/dashboard/accounting")} />
				<span className="text-base font-semibold text-slate-700">
					{isReadOnly ? ACCOUNTING_UI_TEXT.viewPageTitle : ACCOUNTING_UI_TEXT.createPageTitle}
				</span>
			</div>

			<Card className="gap-0 py-0">
				<CardHeader className="inline-flex items-center justify-start border-b px-4 pt-6">
					<CardTitle className="text-left text-base font-semibold text-slate-700">
						{ACCOUNTING_UI_TEXT.cardTitle}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 px-4 py-4">
					{isReadOnly ? (
						<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
							{ACCOUNTING_UI_TEXT.viewOnlyNotice}
						</div>
					) : null}

					<div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start xl:gap-8">
						<div className="space-y-4">
							<div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Account type
								</Label>
								<div className="space-y-1">
									<Select
										value={accountTypeId}
										onValueChange={(val) => {
											setAccountTypeId(val);
											if (errors.accountType) setErrors({ ...errors, accountType: undefined });
										}}
									>
										<SelectTrigger disabled={isLoading || isReadOnly} aria-invalid={!!errors.accountType}>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											{accountTypeOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.accountType ? <p className="text-xs text-red-500">{errors.accountType}</p> : null}
								</div>
							</div>
							<div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Account code
								</Label>
								<div className="space-y-1">
									<Input
										name="accountCode"
										autoComplete="off"
										value={accountCode}
										onChange={(event) => {
											setAccountCode(event.target.value);
											if (errors.code) setErrors({ ...errors, code: undefined });
										}}
										disabled={isCreating || isReadOnly}
										aria-invalid={!!errors.code}
									/>
									{errors.code ? <p className="text-xs text-red-500">{errors.code}</p> : null}
								</div>
							</div>
							<div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Account name
								</Label>
								<div className="space-y-1">
									<Input
										name="accountName"
										autoComplete="off"
										value={accountName}
										onChange={(event) => {
											setAccountName(event.target.value);
											if (errors.name) setErrors({ ...errors, name: undefined });
										}}
										disabled={isCreating || isReadOnly}
										aria-invalid={!!errors.name}
									/>
									{errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-slate-600">Memo</Label>
							<div className="rounded-lg border border-slate-200 bg-white p-3">
								<Textarea
									name="memo"
									autoComplete="off"
									value={memo}
									onChange={(event) => setMemo(event.target.value)}
									placeholder="Write a short note or description..."
									className="min-h-[188px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
									disabled={isCreating || isReadOnly}
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
						<Button variant="outline" onClick={() => navigate("/dashboard/accounting")} disabled={isCreating} className="min-w-32">
							{isReadOnly ? ACCOUNTING_UI_TEXT.close : ACCOUNTING_UI_TEXT.cancel}
						</Button>
						{isReadOnly ? null : (
							<SplitButton
								variant="info"
								mainAction={{
									label: ACCOUNTING_UI_TEXT.saveAndClose,
									onClick: handleSave,
									disabled: isCreating,
								}}
								options={[
									{
										label: ACCOUNTING_UI_TEXT.saveAndNew,
										onClick: handleSave,
										disabled: isCreating,
									},
								]}
							/>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
