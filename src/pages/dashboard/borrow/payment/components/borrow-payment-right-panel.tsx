import { Check, LayoutGrid, Loader2, Wallet } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import { Textarea } from "@/core/ui/textarea";
import { cn } from "@/core/utils";
import { formatDateToYYYYMMDD } from "@/core/utils/date-utils";

interface BorrowPaymentRightPanelProps {
	totalQty: number;
	termMonths: number;
	setTermMonths: (value: number) => void;
	paymentMethod: string;
	setPaymentMethod: (value: string) => void;
	depositAmount: string;
	setDepositAmount: (value: string) => void;
	dueDate: Date;
	setDueDate: (value: Date) => void;
	refNo: string;
	setRefNo: (value: string) => void;
	notes: string;
	setNotes: (value: string) => void;
	onConfirm: () => void;
	isPending: boolean;
}

export function BorrowPaymentRightPanel({
	totalQty,
	termMonths,
	setTermMonths,
	paymentMethod,
	setPaymentMethod,
	depositAmount,
	setDepositAmount,
	dueDate,
	setDueDate,
	refNo,
	setRefNo,
	notes,
	setNotes,
	onConfirm,
	isPending,
}: BorrowPaymentRightPanelProps) {
	return (
		<Tabs defaultValue="payment" className="flex flex-col h-full bg-white border-l border-gray-200">
			{/* Rabbit POS Style Tabs */}
			<TabsList className="w-full justify-start rounded-none h-11 p-0 bg-transparent space-x-4 px-4">
				<TabsTrigger
					value="payment"
					className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent px-1 font-bold text-xs uppercase tracking-wide text-gray-500 gap-2"
				>
					<Wallet className="w-3.5 h-3.5" /> Payment
				</TabsTrigger>
				<TabsTrigger
					value="info"
					className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent px-1 font-bold text-xs uppercase tracking-wide text-gray-500 gap-2"
				>
					<LayoutGrid className="w-3.5 h-3.5" /> Other Info
				</TabsTrigger>
			</TabsList>

			<div className="flex-1 p-4 overflow-y-auto bg-white">
				<TabsContent value="payment" className="space-y-4 mt-0">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">
								<span className="text-red-500">*</span> Payment Method
							</Label>
							<div className="flex gap-2">
								<label
									className={cn(
										"flex items-center gap-2 px-3 py-2 rounded-sm border cursor-pointer transition-all text-xs font-bold uppercase",
										paymentMethod === "cash"
											? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
											: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
									)}
								>
									<input
										type="radio"
										className="hidden"
										checked={paymentMethod === "cash"}
										onChange={() => setPaymentMethod("cash")}
									/>
									<Wallet className="w-3.5 h-3.5" /> Cash
								</label>
							</div>
						</div>

						<div className="space-y-1">
							<Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
								<span className="text-red-500">*</span> Deposit Amount
							</Label>
							<div className="relative">
								<Input
									type="number"
									value={depositAmount}
									onChange={(e) => setDepositAmount(e.target.value)}
									className="h-9 pl-7 font-bold border-blue-200 focus:border-blue-500"
									placeholder="0.00"
								/>
								<span className="absolute left-2.5 top-2.5 text-gray-500 text-xs">$</span>
							</div>
						</div>

						<div className="flex gap-2 w-full">
							<div className="space-y-1 flex-1">
								<Label className="text-xs font-medium text-gray-500 uppercase">Term (Months)</Label>
								<Input
									type="number"
									min={1}
									value={termMonths}
									onChange={(e) => setTermMonths(Number(e.target.value) || 1)}
									className="h-9 border-gray-200 font-medium"
								/>
							</div>
							<div className="space-y-1 flex-1">
								<Label className="text-xs font-medium text-gray-500 uppercase">Due Date</Label>
								<Input
									type="date"
									value={formatDateToYYYYMMDD(dueDate)}
									onChange={(e) => {
										if (!e.target.value) return;
										setDueDate(new Date(`${e.target.value}T00:00:00.000Z`));
									}}
									className="h-9 border-gray-200 font-medium"
								/>
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="info" className="space-y-4 mt-0">
					<div className="space-y-3">
						<div className="space-y-1">
							<Label className="text-xs font-medium text-gray-500 uppercase">Reference No</Label>
							<Input
								value={refNo}
								onChange={(e) => setRefNo(e.target.value)}
								className="h-9 border-gray-200"
								placeholder="REF-..."
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-medium text-gray-500 uppercase">Notes</Label>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="min-h-[100px] border-gray-200 resize-none text-sm"
								placeholder="..."
							/>
						</div>
					</div>
				</TabsContent>
			</div>

			{/* Right Column Footer (Total + Action) */}
			<div className="p-4 border-t bg-gray-50 space-y-3">
				<div className="flex justify-between items-center px-1">
					<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Quantity</span>
					<span className="text-2xl font-bold text-blue-600">{totalQty}</span>
				</div>
				<Button
					disabled={isPending}
					className="w-full h-10 text-xs font-bold uppercase tracking-wide bg-blue-600 hover:bg-blue-700 shadow-md"
					onClick={onConfirm}
				>
					{isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
					{isPending ? "Creating Loan..." : "Confirm & Create Loan"}
				</Button>
			</div>
		</Tabs>
	);
}
