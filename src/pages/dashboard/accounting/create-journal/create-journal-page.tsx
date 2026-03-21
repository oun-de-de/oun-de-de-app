import { CalendarDays, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BackButton, SplitButton } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { formatNumber } from "@/core/utils/formatters";
import { ACCOUNTING_DRAFT_FORM_TEXT, ACCOUNTING_JOURNAL_NAME_OPTIONS } from "../constants";
import { AccountingCreateMenuButton } from "../components/accounting-create-menu-button";
import { useAccountingReferenceData } from "../hooks/use-accounting-reference-data";
import { useGetCurrencyList } from "@/pages/dashboard/settings/hooks/use-settings";
import { saveAccountingDraft } from "../utils/accounting-draft-actions";
import { createEmptyJournalLine, type JournalLine } from "../utils/accounting-line-factories";
import { formatLocalDateTime } from "../utils/format-local-date-time";

export default function CreateJournalPage() {
	const navigate = useNavigate();
	const { chartAccountOptions, employeeOptions, isLoading, journalClassOptions, journalTypeOptions } =
		useAccountingReferenceData({
			accountTypesEnabled: false,
			customersEnabled: false,
		});
	const { data: currencies = [], isLoading: isLoadingCurrencies } = useGetCurrencyList();
	const [refNo] = useState("");
	const [date] = useState(formatLocalDateTime());
	const [employeeId, setEmployeeId] = useState("");
	const [journalType, setJournalType] = useState("");
	const [currencyId, setCurrencyId] = useState("");
	const [memo, setMemo] = useState("");
	const [lines, setLines] = useState<JournalLine[]>([createEmptyJournalLine(0)]);

	const totalDr = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.dr) || 0), 0), [lines]);
	const totalCr = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.cr) || 0), 0), [lines]);
	const currencyOptions = useMemo(() => currencies.map((item) => ({ value: item.id, label: item.name })), [currencies]);

	useEffect(() => {
		if (journalType || journalTypeOptions.length === 0) return;
		setJournalType(journalTypeOptions[0].value);
	}, [journalType, journalTypeOptions]);

	useEffect(() => {
		if (!currencyId && currencies.length > 0) {
			setCurrencyId(currencies[0].id);
		}
	}, [currencies, currencyId]);

	const updateLine = <K extends keyof JournalLine>(id: string, field: K, value: JournalLine[K]) => {
		setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
	};

	const addLine = () => {
		setLines((prev) => [...prev, createEmptyJournalLine(prev.length)]);
	};

	const removeLine = (id: string) => {
		setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
	};

	const handleSave = () => {
		saveAccountingDraft({
			navigate,
			redirectTo: "/dashboard/accounting",
			successMessage: ACCOUNTING_DRAFT_FORM_TEXT.journal.successMessage,
		});
	};

	return (
		<div className="flex h-full flex-col gap-4 p-3 md:p-4">
			<div className="flex items-center gap-3 pb-2">
				<BackButton onClick={() => navigate("/dashboard/accounting")} />
				<div className="flex items-center gap-2 text-slate-700">
					<span className="text-base font-semibold">{ACCOUNTING_DRAFT_FORM_TEXT.journal.pageTitle}</span>
				</div>
			</div>

			<Card className="gap-0 py-0">
				<CardHeader className="justify-between border-b px-4 py-3">
					<CardTitle className="text-left text-base font-semibold text-slate-700">
						{ACCOUNTING_DRAFT_FORM_TEXT.journal.cardTitle}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 px-4 py-4">
					<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{ACCOUNTING_DRAFT_FORM_TEXT.journal.notice}
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
									<span className="text-rose-500">*</span> Journal type
								</Label>
								<Select value={journalType} onValueChange={setJournalType}>
									<SelectTrigger disabled={isLoading}>
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent>
										{journalTypeOptions.map((option) => (
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
								<Label className="text-slate-600">Employee</Label>
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
									<span className="text-rose-500">*</span> Currency
								</Label>
								<Select value={currencyId} onValueChange={setCurrencyId}>
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
							<div className="space-y-1.5">
								<Label className="text-slate-600">
									<span className="text-rose-500">*</span> Memo
								</Label>
								<Textarea value={memo} onChange={(event) => setMemo(event.target.value)} className="min-h-20" />
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
										<th className="px-3 py-2 font-medium text-right">DR</th>
										<th className="px-3 py-2 font-medium text-right">CR</th>
										<th className="px-3 py-2 font-medium">Memo</th>
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
											<td className="px-3 py-2 min-w-[240px]">
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
											<td className="px-3 py-2 min-w-[120px]">
												<Input
													value={line.dr}
													onChange={(event) => updateLine(line.id, "dr", event.target.value.replace(/[^\d.]/g, ""))}
													placeholder="0"
													className="text-right"
												/>
											</td>
											<td className="px-3 py-2 min-w-[120px]">
												<Input
													value={line.cr}
													onChange={(event) => updateLine(line.id, "cr", event.target.value.replace(/[^\d.]/g, ""))}
													placeholder="0"
													className="text-right"
												/>
											</td>
											<td className="px-3 py-2 min-w-[180px]">
												<Input
													value={line.memo}
													onChange={(event) => updateLine(line.id, "memo", event.target.value)}
													placeholder="Memo"
												/>
											</td>
											<td className="px-3 py-2 min-w-[180px]">
												<Select value={line.name} onValueChange={(value) => updateLine(line.id, "name", value)}>
													<SelectTrigger>
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent>
														{ACCOUNTING_JOURNAL_NAME_OPTIONS.map((option) => (
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
													aria-label="Remove journal line"
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
						<div className="border-t px-4 py-4">
							<div className="flex items-center justify-between gap-3">
								<AccountingCreateMenuButton
									variant="info"
									size="sm"
									mainAction={{ label: "+ New", onClick: addLine }}
									optionLabels={["Create Journal", "Create Cash Transaction", "Create Expense"]}
								/>
								<div className="flex gap-3">
									<div className="flex min-w-[300px] items-center justify-between rounded-md border bg-white px-4 py-3">
										<span className="text-base font-semibold text-slate-700">Total Debits:</span>
										<span className="text-lg font-semibold text-slate-900">{formatNumber(totalDr)}</span>
									</div>
									<div className="flex min-w-[300px] items-center justify-between rounded-md border bg-white px-4 py-3">
										<span className="text-base font-semibold text-slate-700">Total Credits:</span>
										<span className="text-lg font-semibold text-slate-900">{formatNumber(totalCr)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<Button variant="outline" onClick={() => navigate("/dashboard/accounting")}>
							Cancel
						</Button>
						<SplitButton
							variant="info"
							mainAction={{ label: ACCOUNTING_DRAFT_FORM_TEXT.journal.saveAndClose, onClick: handleSave }}
							options={[
								{
									label: ACCOUNTING_DRAFT_FORM_TEXT.journal.saveAndNew,
									onClick: () =>
										saveAccountingDraft({
											successMessage: ACCOUNTING_DRAFT_FORM_TEXT.journal.successMessage,
										}),
								},
							]}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
