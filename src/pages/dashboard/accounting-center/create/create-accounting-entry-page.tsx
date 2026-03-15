import { CalendarDays, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { BackButton, SplitButton } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { formatNumber } from "@/core/utils/formatters";

type TransactionLine = {
	id: string;
	accountCode: string;
	memo: string;
	payMethod: string;
	amount: string;
	name: string;
	className: string;
};

const EMPLOYEE_OPTIONS = [
	{ value: "emp-01", label: "001 : General Employee" },
	{ value: "emp-02", label: "Sokha" },
	{ value: "emp-03", label: "Dara" },
];

const JOURNAL_OPTIONS = [
	{ value: "deposit", label: "Deposit" },
	{ value: "withdrawal", label: "Withdrawal" },
	{ value: "transfer", label: "Transfer" },
];

const CURRENCY_OPTIONS = [
	{ value: "KHR", label: "KHR" },
	{ value: "USD", label: "USD" },
];

const ACCOUNT_OPTIONS = [
	{ value: "13512B", label: "13512B : Cash On Hand" },
	{ value: "13514A", label: "13514A : ABA Bank" },
	{ value: "13110", label: "13110 : Inventory Asset" },
	{ value: "12128A", label: "12128A : Other Receivable" },
];

const PAY_METHOD_OPTIONS = [
	{ value: "cash", label: "Cash" },
	{ value: "bank", label: "Bank" },
	{ value: "transfer", label: "Transfer" },
];

const NAME_OPTIONS = [
	{ value: "supplier-a", label: "Atlas Supplies" },
	{ value: "customer-a", label: "Tony Trading" },
	{ value: "walk-in", label: "Walk-in" },
];

const CLASS_OPTIONS = [
	{ value: "current-asset", label: "Current Asset" },
	{ value: "expense", label: "Expense" },
	{ value: "other", label: "Other" },
];

function createEmptyLine(index: number): TransactionLine {
	return {
		id: `line-${index + 1}`,
		accountCode: "",
		memo: "",
		payMethod: "",
		amount: "",
		name: "",
		className: "",
	};
}

function formatLocalDateTime(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");
	return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export default function CreateAccountingEntryPage() {
	const navigate = useNavigate();
	const [refNo] = useState("000001");
	const [date] = useState(formatLocalDateTime());
	const [employeeId, setEmployeeId] = useState("emp-01");
	const [journalType, setJournalType] = useState("");
	const [currency, setCurrency] = useState("KHR");
	const [memo, setMemo] = useState("");
	const [lines, setLines] = useState<TransactionLine[]>([createEmptyLine(0), createEmptyLine(1)]);

	const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0), [lines]);

	const updateLine = <K extends keyof TransactionLine>(id: string, field: K, value: TransactionLine[K]) => {
		setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
	};

	const addLine = () => {
		setLines((prev) => [...prev, createEmptyLine(prev.length)]);
	};

	const removeLine = (id: string) => {
		setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
	};

	const handleSave = () => {
		toast.success("Create cash transaction draft saved");
		navigate("/dashboard/accounting-center");
	};

	return (
		<div className="flex h-full flex-col gap-4 p-3 md:p-4">
			<div className="flex items-center gap-3 border-b border-slate-200 pb-2">
				<BackButton onClick={() => navigate("/dashboard/accounting-center")} />
				<span className="text-base font-semibold text-slate-700">Create Cash Transaction</span>
			</div>

			<Card className="gap-0 py-0">
				<CardHeader className="justify-start border-b px-4 py-3">
					<CardTitle className="text-left text-base font-semibold text-slate-700">Create Cash Transaction</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 px-4 py-4">
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
									<SelectTrigger>
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent>
										{JOURNAL_OPTIONS.map((option) => (
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
								<Select value={currency} onValueChange={setCurrency}>
									<SelectTrigger>
										<SelectValue placeholder="Select currency" />
									</SelectTrigger>
									<SelectContent>
										{CURRENCY_OPTIONS.map((option) => (
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
									<SelectTrigger>
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent>
										{EMPLOYEE_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label className="text-slate-600">Memo</Label>
								<Textarea
									value={memo}
									onChange={(event) => setMemo(event.target.value)}
									placeholder="Enter memo"
									className="min-h-24"
								/>
							</div>
						</div>
					</div>

					<div className="rounded-md border">
						<div className="grid grid-cols-2 border-b bg-sky-50 text-sm font-semibold text-sky-600">
							<div className="border-r px-4 py-3">From:{currency}</div>
							<div className="px-4 py-3">To:{currency}</div>
						</div>
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b bg-slate-50 text-left text-slate-600">
										<th className="px-3 py-2 font-medium">No</th>
										<th className="px-3 py-2 font-medium">Account</th>
										<th className="px-3 py-2 font-medium">Memo</th>
										<th className="px-3 py-2 font-medium">Pay Method</th>
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
											<td className="px-3 py-2 min-w-[220px]">
												<Select
													value={line.accountCode}
													onValueChange={(value) => updateLine(line.id, "accountCode", value)}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select account" />
													</SelectTrigger>
													<SelectContent>
														{ACCOUNT_OPTIONS.map((option) => (
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
												/>
											</td>
											<td className="px-3 py-2 min-w-[160px]">
												<Select
													value={line.payMethod}
													onValueChange={(value) => updateLine(line.id, "payMethod", value)}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent>
														{PAY_METHOD_OPTIONS.map((option) => (
															<SelectItem key={option.value} value={option.value}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</td>
											<td className="px-3 py-2 min-w-[140px]">
												<Input
													value={line.amount}
													onChange={(event) => updateLine(line.id, "amount", event.target.value.replace(/[^\d.]/g, ""))}
													placeholder="0"
													className="text-right"
												/>
											</td>
											<td className="px-3 py-2 min-w-[180px]">
												<Select value={line.name} onValueChange={(value) => updateLine(line.id, "name", value)}>
													<SelectTrigger>
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent>
														{NAME_OPTIONS.map((option) => (
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
													<SelectTrigger>
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent>
														{CLASS_OPTIONS.map((option) => (
															<SelectItem key={option.value} value={option.value}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</td>
											<td className="px-3 py-2 text-center">
												<Button variant="ghost" size="icon" onClick={() => removeLine(line.id)}>
													<Trash2 className="size-4 text-rose-500" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="flex items-center justify-between gap-3 border-t px-4 py-4">
							<SplitButton
								variant="info"
								size="sm"
								mainAction={{ label: "+ New", onClick: addLine }}
								options={[
									{ label: "Create Cash Transaction", onClick: () => navigate("/dashboard/accounting-center/create") },
									{ label: "Create Journal", onClick: () => navigate("/dashboard/accounting/create-journal") },
									{ label: "Create Cash Expense", onClick: () => navigate("/dashboard/accounting/create-expense") },
								]}
							/>
							<div className="flex min-w-[240px] items-center justify-between rounded-md border bg-white px-4 py-3">
								<span className="text-base font-semibold text-slate-700">Total:</span>
								<span className="text-lg font-semibold text-slate-900">{formatNumber(totalAmount)} ៛</span>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<Button variant="outline" onClick={() => navigate("/dashboard/accounting-center")}>
							Cancel
						</Button>
						<SplitButton
							variant="info"
							mainAction={{ label: "Save & Close", onClick: handleSave }}
							options={[{ label: "Save & New", onClick: () => toast.success("Create cash transaction draft saved") }]}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
