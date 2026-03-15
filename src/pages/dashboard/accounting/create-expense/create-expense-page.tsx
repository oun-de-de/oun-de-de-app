import { BackButton, SplitButton } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	useComboboxAnchor,
} from "@/core/ui/combobox";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Textarea } from "@/core/ui/textarea";
import { formatNumber } from "@/core/utils/formatters";
import { CalendarDays, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type ExpenseLine = {
	id: string;
	accountCode: string;
	memo: string;
	amount: string;
	name: string;
	nameInput: string;
	className: string;
};

const CASH_ACCOUNT_OPTIONS = [
	{ value: "13512B", label: "13512B : Cash On Hand", type: "Current Asset" },
	{ value: "13514A", label: "13514A : ABA Bank", type: "Current Asset" },
	{ value: "12110", label: "12110 : Accounts Receivable", type: "Accounts Receivable (A/R)" },
	{ value: "12117A", label: "12117A : Customer Receivable", type: "Accounts Receivable (A/R)" },
	{ value: "12119A", label: "12119A : Advance", type: "Accounts Receivable (A/R)" },
	{ value: "12122A", label: "12122A : Other Receivable", type: "Accounts Receivable (A/R)" },
	{ value: "12124A", label: "12124A : Employee Receivable", type: "Accounts Receivable (A/R)" },
	{ value: "12125A", label: "12125A : Borrower Receivable", type: "Accounts Receivable (A/R)" },
	{ value: "12126A", label: "12126A : Partner Receivable", type: "Accounts Receivable (A/R)" },
];

const EMPLOYEE_OPTIONS = [
	{ value: "emp-01", label: "001 : General Employee" },
	{ value: "emp-02", label: "Sokha" },
	{ value: "emp-03", label: "Dara" },
];

const ACCOUNT_OPTIONS = [
	{ value: "10116A", label: "10116A : Office Expense" },
	{ value: "10116B", label: "10116B : Fuel Expense" },
	{ value: "12155A", label: "12155A : Maintenance Expense" },
	{ value: "12161A", label: "12161A : Staff Welfare" },
	{ value: "13511X", label: "13511X : General Expense" },
];

const NAME_OPTIONS = [
	{ value: "customer-001", label: "កាណា", type: "Customer" },
	{ value: "customer-002", label: "គុណ (2ភ្នូតង)", type: "Customer" },
	{ value: "customer-003", label: "សុភ័ក្រ្ត (តាំងជាប់ផ្សារតាខ្មៅ)", type: "Customer" },
	{ value: "customer-004", label: "ព្រីង", type: "Customer" },
	{ value: "customer-005", label: "មុនា", type: "Customer" },
	{ value: "customer-006", label: "មី (2ខ65511)", type: "Customer" },
	{ value: "customer-007", label: "រ៉ា (ឆី2AA-9221)", type: "Customer" },
	{ value: "customer-008", label: "ចេង (2AM-0507)", type: "Customer" },
];

const CLASS_OPTIONS = [
	{ value: "expense", label: "Expense" },
	{ value: "operation", label: "Operation" },
	{ value: "other", label: "Other" },
];

const CURRENCY_OPTIONS = [
	{ value: "USD", label: "USD" },
	{ value: "KHR", label: "KHR" },
];

function createEmptyLine(index: number): ExpenseLine {
	return {
		id: `line-${index + 1}`,
		accountCode: "",
		memo: "",
		amount: "",
		name: "",
		nameInput: "",
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

function ExpenseNameCombobox({
	line,
	onNameChange,
}: {
	line: ExpenseLine;
	onNameChange: (name: string, nameInput: string) => void;
}) {
	const anchorRef = useComboboxAnchor();
	const selectedOption = NAME_OPTIONS.find((option) => option.value === line.name) ?? null;

	return (
		<Combobox<(typeof NAME_OPTIONS)[number]>
			items={NAME_OPTIONS}
			value={selectedOption}
			inputValue={line.nameInput}
			onValueChange={(option) => onNameChange(option?.value ?? "", option?.label ?? "")}
			onInputValueChange={(nextInputValue) => onNameChange("", nextInputValue)}
		>
			<div ref={anchorRef} className="w-full">
				<ComboboxInput className="w-full bg-background" placeholder="Search... (100)" aria-label="Name" />
			</div>
			<ComboboxContent anchor={anchorRef}>
				<ComboboxEmpty>No matching name.</ComboboxEmpty>
				<ComboboxList>
					{(option) => (
						<ComboboxItem value={option}>
							<div className="flex w-full items-center justify-between gap-4">
								<span>{option.label}</span>
								<span className="text-xs text-slate-500 italic">{option.type}</span>
							</div>
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}

export default function CreateExpensePage() {
	const navigate = useNavigate();
	const [refNo] = useState("000065");
	const [date] = useState(formatLocalDateTime());
	const [currency, setCurrency] = useState("USD");
	const [cashAccount, setCashAccount] = useState("");
	const [employeeId, setEmployeeId] = useState("");
	const [memo, setMemo] = useState("");
	const [lines, setLines] = useState<ExpenseLine[]>([createEmptyLine(0)]);

	const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0), [lines]);

	const updateLine = <K extends keyof ExpenseLine>(id: string, field: K, value: ExpenseLine[K]) => {
		setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
	};

	const addLine = () => {
		setLines((prev) => [...prev, createEmptyLine(prev.length)]);
	};

	const removeLine = (id: string) => {
		setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
	};

	const handleSave = () => {
		toast.success("Create expense draft saved");
		navigate("/dashboard/accounting");
	};

	return (
		<div className="flex h-full flex-col gap-4 p-3 md:p-4">
			<div className="flex items-center gap-3 border-b border-slate-200 pb-2">
				<BackButton onClick={() => navigate("/dashboard/accounting")} />
				<div className="flex items-center gap-2 text-slate-700">
					<span className="text-base font-semibold">Create Cash Expense</span>
				</div>
			</div>

			<Card className="gap-0 py-0">
				<CardHeader className="justify-start border-b px-4 py-3">
					<CardTitle className="text-left text-base font-semibold text-slate-700">Create Cash Expense</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 px-4 py-4">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
						<div className="space-y-3">
							<div className="space-y-1.5">
								<Label htmlFor="expense-ref-no" className="text-slate-600">
									<span className="text-rose-500">*</span> Ref No
								</Label>
								<div className="grid grid-cols-[64px_1fr] gap-2">
									<Input id="expense-ref-prefix" value="EXP" disabled />
									<Input id="expense-ref-no" value={refNo} disabled />
								</div>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="expense-date" className="text-slate-600">
									<span className="text-rose-500">*</span> Date
								</Label>
								<div className="relative">
									<CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
									<Input id="expense-date" value={date} disabled className="pl-9" />
								</div>
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
									<span className="text-rose-500">*</span> Cash & Cash Equivalents
								</Label>
								<Select value={cashAccount} onValueChange={setCashAccount}>
									<SelectTrigger>
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent>
										{CASH_ACCOUNT_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												<div className="flex min-w-[280px] items-center justify-between gap-4">
													<span>{option.label}</span>
													<span className="text-xs text-slate-500">{option.type}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
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
								<Label htmlFor="expense-memo" className="text-slate-600">
									<span className="text-rose-500">*</span> Memo
								</Label>
								<Textarea
									id="expense-memo"
									value={memo}
									onChange={(event) => setMemo(event.target.value)}
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
												<Select
													value={line.accountCode}
													onValueChange={(value) => updateLine(line.id, "accountCode", value)}
												>
													<SelectTrigger className={index === 0 ? "border-sky-400" : undefined}>
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
												<Input
													value={line.amount}
													onChange={(event) => updateLine(line.id, "amount", event.target.value.replace(/[^\d.]/g, ""))}
													placeholder="0"
													className="text-right"
												/>
											</td>
											<td className="px-3 py-2 min-w-[180px]">
												<ExpenseNameCombobox
													line={line}
													onNameChange={(name, nameInput) => {
														updateLine(line.id, "name", name);
														updateLine(line.id, "nameInput", nameInput);
													}}
												/>
											</td>
											<td className="px-3 py-2 min-w-[160px]">
												<Select
													value={line.className}
													onValueChange={(value) => updateLine(line.id, "className", value)}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select class" />
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
									{ label: "Create Cash Expense", onClick: () => navigate("/dashboard/accounting/create-expense") },
									{ label: "Create Journal", onClick: () => navigate("/dashboard/accounting/create-journal") },
									{ label: "Create Cash Transaction", onClick: () => navigate("/dashboard/accounting-center/create") },
								]}
							/>
							<div className="flex min-w-[260px] items-center justify-between rounded-md border bg-white px-4 py-3">
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
							mainAction={{ label: "Save & Close", onClick: handleSave }}
							options={[{ label: "Save & New", onClick: () => toast.success("Create expense draft saved") }]}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
