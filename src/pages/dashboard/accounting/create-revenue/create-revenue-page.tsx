import { BackButton } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { formatNumber } from "@/core/utils/formatters";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ACCOUNTING_DRAFT_FORM_TEXT, ACCOUNTING_REVENUE_NAME_OPTIONS } from "../constants";
import { useAccountingReferenceData } from "../hooks/use-accounting-reference-data";
import { saveAccountingDraft } from "../utils/accounting-draft-actions";
import { createEmptyRevenueLine, type RevenueLine } from "../utils/accounting-line-factories";
import { formatLocalDateTime } from "../utils/format-local-date-time";

export default function CreateRevenuePage() {
	const navigate = useNavigate();
	const { chartAccountOptions, employeeOptions, isLoading, journalClassOptions } = useAccountingReferenceData();
	const [refNo] = useState("REVXXXXXXXXXX");
	const [date] = useState(formatLocalDateTime());
	const [cashAccount, setCashAccount] = useState("");
	const [employeeId, setEmployeeId] = useState("");
	const [memo, setMemo] = useState("");
	const [lines, setLines] = useState<RevenueLine[]>([createEmptyRevenueLine(0)]);

	const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0), [lines]);

	const updateLine = <K extends keyof RevenueLine>(id: string, field: K, value: RevenueLine[K]) => {
		setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
	};

	const addLine = () => {
		setLines((prev) => [...prev, createEmptyRevenueLine(prev.length)]);
	};

	const removeLine = (id: string) => {
		setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
	};

	const handleSave = () => {
		saveAccountingDraft({
			navigate,
			redirectTo: "/dashboard/accounting",
			successMessage: ACCOUNTING_DRAFT_FORM_TEXT.revenue.successMessage,
		});
	};

	return (
		<div className="flex h-full flex-col gap-4 p-3 md:p-4">
			<div className="flex items-center gap-3 border-b border-slate-200 pb-2">
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
					<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{ACCOUNTING_DRAFT_FORM_TEXT.revenue.notice}
					</div>
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
						<div className="space-y-3">
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Ref No
								</Label>
								<div className="grid grid-cols-[1fr_48px] gap-2">
									<Input value={refNo} disabled />
									<Input value="" disabled />
								</div>
							</div>
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Date
								</Label>
								<div className="relative">
									<CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
									<Input value={date} disabled className="pl-9" />
								</div>
							</div>
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Cash & Cash Equivalents
								</Label>
								<Select value={cashAccount} onValueChange={setCashAccount}>
									<SelectTrigger disabled={isLoading}>
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent>
										{chartAccountOptions.map((option) => (
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
									<span className="text-rose-500">*</span> Employee
								</Label>
								<Select value={employeeId} onValueChange={setEmployeeId}>
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
								<Textarea value={memo} onChange={(event) => setMemo(event.target.value)} className="min-h-24" />
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
														<SelectValue placeholder="Select account" />
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
													onChange={(event) => updateLine(line.id, "amount", event.target.value.replace(/[^\d.]/g, ""))}
													placeholder="0"
													className="text-right"
												/>
											</td>
											<td className="min-w-[180px] px-3 py-2">
												<Select value={line.name} onValueChange={(value) => updateLine(line.id, "name", value)}>
													<SelectTrigger>
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent>
														{ACCOUNTING_REVENUE_NAME_OPTIONS.map((option) => (
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
									))}
								</tbody>
							</table>
						</div>
						<div className="flex items-center justify-between border-t px-4 py-4">
							<Button variant="info" size="sm" className="gap-2" onClick={addLine}>
								<Plus className="size-4" />
								New
							</Button>
							<div className="flex min-w-[280px] items-center justify-between rounded-md border bg-white px-4 py-3">
								<span className="text-base font-semibold text-slate-700">Total:</span>
								<span className="text-lg font-semibold text-slate-900">{formatNumber(totalAmount)}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<Button variant="outline" onClick={() => navigate("/dashboard/accounting")}>
							Cancel
						</Button>
						<Button variant="info" onClick={handleSave}>
							{ACCOUNTING_DRAFT_FORM_TEXT.revenue.saveAndClose}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
