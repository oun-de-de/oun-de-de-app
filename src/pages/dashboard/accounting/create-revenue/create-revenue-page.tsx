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
import { toast } from "sonner";

type RevenueLine = {
	id: string;
	accountCode: string;
	memo: string;
	amount: string;
	name: string;
	className: string;
};

const CASH_ACCOUNT_OPTIONS = [
	{ value: "13512B", label: "13512B : Cash On Hand", type: "Current Asset" },
	{ value: "13514A", label: "13514A : ABA Bank", type: "Current Asset" },
	{ value: "10115A", label: "10115A : Cash In Bank", type: "Current Asset" },
];

const EMPLOYEE_OPTIONS = [
	{ value: "emp-01", label: "Administrator" },
	{ value: "emp-02", label: "Sokha" },
	{ value: "emp-03", label: "Dara" },
];

const ACCOUNT_OPTIONS = [
	{ value: "40110", label: "40110 : Cash Sale Revenue" },
	{ value: "40120", label: "40120 : Service Revenue" },
	{ value: "40210", label: "40210 : Other Income" },
	{ value: "12110", label: "12110 : Accounts Receivable" },
];

const NAME_OPTIONS = [
	{ value: "tony", label: "Tony Trading" },
	{ value: "walk-in", label: "Walk-in" },
	{ value: "retail", label: "Retail Customer" },
];

const CLASS_OPTIONS = [
	{ value: "revenue", label: "Revenue" },
	{ value: "income", label: "Income" },
	{ value: "other", label: "Other" },
];

function createEmptyLine(index: number): RevenueLine {
	return {
		id: `line-${index + 1}`,
		accountCode: index === 0 ? "40110" : "",
		memo: "",
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

export default function CreateRevenuePage() {
	const navigate = useNavigate();
	const [refNo] = useState("REV000062");
	const [date] = useState(formatLocalDateTime());
	const [cashAccount, setCashAccount] = useState("");
	const [employeeId, setEmployeeId] = useState("");
	const [memo, setMemo] = useState("");
	const [lines, setLines] = useState<RevenueLine[]>([createEmptyLine(0), createEmptyLine(1), createEmptyLine(2)]);

	const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0), [lines]);

	const updateLine = <K extends keyof RevenueLine>(id: string, field: K, value: RevenueLine[K]) => {
		setLines((prev) => prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
	};

	const addLine = () => {
		setLines((prev) => [...prev, createEmptyLine(prev.length)]);
	};

	const removeLine = (id: string) => {
		setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.id !== id) : prev));
	};

	const handleSave = () => {
		toast.success("Revenue draft saved");
		navigate("/dashboard/accounting");
	};

	return (
		<div className="flex h-full flex-col gap-4 p-3 md:p-4">
			<div className="flex items-center gap-3 border-b border-slate-200 pb-2">
				<BackButton onClick={() => navigate("/dashboard/accounting")} />
				<div className="flex items-center gap-2 text-slate-700">
					<span className="text-base font-semibold">Create Cash Revenue</span>
				</div>
			</div>

			<Card className="gap-0 py-0">
				<CardHeader className="justify-start border-b px-4 py-3">
					<CardTitle className="text-left text-base font-semibold text-slate-700">Create Cash Revenue</CardTitle>
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
														{NAME_OPTIONS.map((option) => (
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
							Save & Close
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
