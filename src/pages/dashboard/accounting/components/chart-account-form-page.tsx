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

	const handleSave = async () => {
		if (!isFormValid) {
			toast.error(ACCOUNTING_UI_TEXT.formIncomplete);
			return;
		}

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
				<CardHeader className="justify-start border-b px-4 py-3">
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

					<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
						<div className="space-y-3">
							<div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Account type
								</Label>
								<Select value={accountTypeId} onValueChange={setAccountTypeId}>
									<SelectTrigger disabled={isLoading || isReadOnly}>
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
							</div>
							<div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Account code
								</Label>
								<Input
									value={accountCode}
									onChange={(event) => setAccountCode(event.target.value)}
									disabled={isCreating || isReadOnly}
								/>
							</div>
							<div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Account name
								</Label>
								<Input
									value={accountName}
									onChange={(event) => setAccountName(event.target.value)}
									disabled={isCreating || isReadOnly}
								/>
							</div>
						</div>

						<div className="space-y-3">
							<div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start">
								<Label className="text-slate-600">Memo</Label>
								<Textarea
									value={memo}
									onChange={(event) => setMemo(event.target.value)}
									className="min-h-24"
									disabled={isCreating || isReadOnly}
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<Button variant="outline" onClick={() => navigate("/dashboard/accounting")} disabled={isCreating}>
							{isReadOnly ? ACCOUNTING_UI_TEXT.close : ACCOUNTING_UI_TEXT.cancel}
						</Button>
						{isReadOnly ? null : (
							<SplitButton
								variant="info"
								mainAction={{
									label: ACCOUNTING_UI_TEXT.saveAndClose,
									onClick: handleSave,
									disabled: isCreating || !isFormValid,
								}}
								options={[
									{
										label: ACCOUNTING_UI_TEXT.saveAndNew,
										onClick: handleSave,
										disabled: isCreating || !isFormValid,
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
