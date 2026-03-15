import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { accountingAccountList } from "@/_mock/data/dashboard";
import { BackButton, SplitButton } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { RadioGroup, RadioGroupItem } from "@/core/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";

const ACCOUNT_TYPE_OPTIONS = [
	{ value: "current-asset", label: "Current Asset" },
	{ value: "asset", label: "Asset" },
	{ value: "liability", label: "Liability" },
	{ value: "equity", label: "Equity" },
	{ value: "revenue", label: "Revenue" },
	{ value: "expense", label: "Expense" },
];

const PARENT_ACCOUNT_OPTIONS = [
	{ value: "12226A", label: "12226A : Parent Account" },
	{ value: "12110", label: "12110 : Accounts Receivable" },
	{ value: "10115A", label: "10115A : ABA Bank" },
];

type ChartAccountFormPageProps = {
	mode: "create" | "edit";
};

export function ChartAccountFormPage({ mode }: ChartAccountFormPageProps) {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const selectedAccount = useMemo(
		() => (mode === "edit" && id ? accountingAccountList.find((account) => account.id === id) : undefined),
		[id, mode],
	);
	const [accountType, setAccountType] = useState("current-asset");
	const [parentAccount, setParentAccount] = useState("");
	const [status, setStatus] = useState("active");
	const [accountCode, setAccountCode] = useState("");
	const [accountName, setAccountName] = useState("");
	const [memo, setMemo] = useState("");

	useEffect(() => {
		if (mode !== "edit" || !selectedAccount) return;

		const [nextCode = "", ...nameParts] = selectedAccount.name.split(" : ");
		setAccountCode(nextCode);
		setAccountName(nameParts.join(" : "));
		setAccountType(selectedAccount.type || "current-asset");
		setStatus(selectedAccount.status === "inactive" ? "inactive" : "active");
	}, [mode, selectedAccount]);

	const isEdit = mode === "edit";
	const pageTitle = isEdit ? "Edit Chart Account" : "Create Chart Account";
	const cardTitle = isEdit ? "Chart of account" : "Chart of account";
	const successMessage = isEdit ? "Chart account updated" : "Chart account draft saved";

	const handleSave = () => {
		toast.success(successMessage);
		navigate("/dashboard/accounting");
	};

	return (
		<div className="flex h-full flex-col gap-4 p-3 md:p-4">
			<div className="flex items-center gap-3 border-b border-slate-200 pb-2">
				<BackButton onClick={() => navigate("/dashboard/accounting")} />
				<span className="text-base font-semibold text-slate-700">{pageTitle}</span>
			</div>

			<Card className="gap-0 py-0">
				<CardHeader className="justify-start border-b px-4 py-3">
					<CardTitle className="text-left text-base font-semibold text-slate-700">{cardTitle}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 px-4 py-4">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
						<div className="space-y-3">
							<div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Account type
								</Label>
								<Select value={accountType} onValueChange={setAccountType}>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{ACCOUNT_TYPE_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">Parent Account</Label>
								<Select value={parentAccount} onValueChange={setParentAccount}>
									<SelectTrigger>
										<SelectValue placeholder="Select parent account" />
									</SelectTrigger>
									<SelectContent>
										{PARENT_ACCOUNT_OPTIONS.map((option) => (
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
								<Input value={accountCode} onChange={(event) => setAccountCode(event.target.value)} />
							</div>
							<div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Account name
								</Label>
								<Input value={accountName} onChange={(event) => setAccountName(event.target.value)} />
							</div>
						</div>

						<div className="space-y-3">
							<div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Status
								</Label>
								<RadioGroup value={status} onValueChange={setStatus} className="flex items-center gap-8">
									<div className="flex items-center gap-2">
										<RadioGroupItem value="active" id={`chart-account-active-${mode}`} />
										<Label htmlFor={`chart-account-active-${mode}`} className="cursor-pointer text-slate-700">
											Active
										</Label>
									</div>
									<div className="flex items-center gap-2">
										<RadioGroupItem value="inactive" id={`chart-account-inactive-${mode}`} />
										<Label htmlFor={`chart-account-inactive-${mode}`} className="cursor-pointer text-slate-700">
											Inactive
										</Label>
									</div>
								</RadioGroup>
							</div>
							<div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start">
								<Label className="text-slate-600">Memo</Label>
								<Textarea value={memo} onChange={(event) => setMemo(event.target.value)} className="min-h-24" />
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<Button variant="outline" onClick={() => navigate("/dashboard/accounting")}>
							Cancel
						</Button>
						<SplitButton
							variant="info"
							mainAction={{ label: "Save & Close", onClick: handleSave }}
							options={[
								{
									label: isEdit ? "Save & Keep Editing" : "Save & New",
									onClick: () => toast.success(successMessage),
								},
							]}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
