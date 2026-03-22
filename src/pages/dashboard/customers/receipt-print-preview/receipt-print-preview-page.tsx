import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { BackButton } from "@/core/components/common";
import type { ReceiptPrintPreviewState } from "../types/receipt-print-preview";
import { Button } from "@/core/ui/button";
import { formatNumber } from "@/core/utils/formatters";

export default function ReceiptPrintPreviewPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const state = (location.state as ReceiptPrintPreviewState | null) ?? null;
	const autoPrintStorageKey = useMemo(() => `receipt-preview-auto-print:${location.key}`, [location.key]);

	const handlePrint = useCallback(() => {
		window.print();
	}, []);

	useEffect(() => {
		if (!state) return;
		if (window.sessionStorage.getItem(autoPrintStorageKey) === "done") return;

		window.sessionStorage.setItem(autoPrintStorageKey, "done");

		const styleId = "receipt-print-page-size-style";
		let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent =
			"@media print { @page { size: landscape; margin: 8mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }";

		const timer = window.setTimeout(() => {
			handlePrint();
		}, 120);

		return () => {
			window.clearTimeout(timer);
			styleEl?.remove();
		};
	}, [autoPrintStorageKey, handlePrint, state]);

	if (!state) {
		return (
			<div className="flex h-full items-center justify-center p-4">
				<div className="space-y-3 text-center">
					<div className="text-lg font-semibold text-slate-700">Receipt preview data is missing</div>
					<div className="text-sm text-slate-500">
						Open this page from the receipt editor to generate a printable receipt.
					</div>
					<div className="flex justify-center">
						<BackButton onClick={() => navigate("/dashboard/customers")} />
					</div>
				</div>
			</div>
		);
	}

	const invoiceRefsText = useMemo(() => state.rows.map((row) => row.refNo).join(", "), [state.rows]);

	return (
		<div className="flex h-full flex-col overflow-auto bg-slate-200 p-3 print:block print:bg-white print:p-0">
			<div className="mb-3 flex items-center gap-3 print:hidden">
				<BackButton onClick={() => navigate(-1)} />
				<Button variant="info" onClick={handlePrint}>
					Print
				</Button>
			</div>

			<div className="mx-auto w-full max-w-[1280px] bg-white px-8 py-6 text-black shadow-sm print:max-w-none print:shadow-none">
				<div className="mb-4 flex items-start gap-5">
					<div className="flex size-20 shrink-0 items-center justify-center rounded-full border-[3px] border-sky-500 bg-sky-300 text-center text-2xl font-bold text-white">
						LC
					</div>
					<div className="flex-1 text-center">
						<div className="text-[34px] font-black leading-tight">ឃ្មុំតាលេវអនាម័យ ស៊ីម ចាន់ណា II</div>
						<div className="mt-5 text-[16px] font-semibold leading-7 text-slate-700">
							ទីតាំង : {state.address || "ឃ្មុំតាលេវ"} លេខទូរស័ព្ទទំនាក់ទំនង (TEL: {state.telephone || "070 66 9898"})
						</div>
						<div className="mt-1 text-[22px] font-bold">បង្កាន់ដៃទទួលប្រាក់</div>
					</div>
				</div>

				<div className="mb-3 border-t-[3px] border-black pt-2 text-[18px] font-bold">
					<div className="flex items-center justify-between gap-6">
						<div>អតិថិជន : {state.customerLabel}</div>
						<div>
							{state.refPrefix} No : {state.refPrefix}
							{state.refNo}
						</div>
					</div>
					<div className="mt-1 flex items-center justify-between gap-6">
						<div>លេខទូរស័ព្ទ : {state.telephone || "-"}</div>
						<div>Date : {state.date}</div>
					</div>
				</div>

				<table className="w-full border-collapse text-[16px]">
					<thead>
						<tr>
							<th className="border-[3px] border-slate-700 px-2 py-2 text-center font-bold">ល.រ</th>
							<th className="border-[3px] border-slate-700 px-2 py-2 text-center font-bold">Ref No</th>
							<th className="border-[3px] border-slate-700 px-2 py-2 text-center font-bold">កាលបរិច្ឆេទ</th>
							<th className="border-[3px] border-slate-700 px-2 py-2 text-center font-bold">ដើម</th>
							<th className="border-[3px] border-slate-700 px-2 py-2 text-center font-bold">នៅសល់</th>
							<th className="border-[3px] border-slate-700 px-2 py-2 text-center font-bold">ទទួល</th>
							<th className="border-[3px] border-slate-700 px-2 py-2 text-center font-bold">ដក</th>
						</tr>
					</thead>
					<tbody>
						{state.rows.map((row) => (
							<tr key={row.refNo}>
								<td className="border-[3px] border-slate-700 px-2 py-3 text-center">{row.no}</td>
								<td className="border-[3px] border-slate-700 px-2 py-3 text-center">{row.refNo}</td>
								<td className="border-[3px] border-slate-700 px-2 py-3 text-center">{row.date}</td>
								<td className="border-[3px] border-slate-700 px-2 py-3 text-right">{formatNumber(row.original)} ៛</td>
								<td className="border-[3px] border-slate-700 px-2 py-3 text-right">{formatNumber(row.open)} ៛</td>
								<td className="border-[3px] border-slate-700 px-2 py-3 text-right">{formatNumber(row.received)} ៛</td>
								<td className="border-[3px] border-slate-700 px-2 py-3 text-right">{formatNumber(row.withdrawal)} ៛</td>
							</tr>
						))}
						{Array.from({ length: Math.max(0, 3 - state.rows.length) }).map((_, index) => (
							<tr key={`blank-${index}`}>
								<td className="border-[3px] border-slate-700 px-2 py-5" />
								<td className="border-[3px] border-slate-700 px-2 py-5" />
								<td className="border-[3px] border-slate-700 px-2 py-5" />
								<td className="border-[3px] border-slate-700 px-2 py-5" />
								<td className="border-[3px] border-slate-700 px-2 py-5" />
								<td className="border-[3px] border-slate-700 px-2 py-5" />
								<td className="border-[3px] border-slate-700 px-2 py-5" />
							</tr>
						))}
					</tbody>
				</table>

				<div className="mt-3 flex justify-end">
					<div className="w-[360px] space-y-1 text-[18px] font-bold">
						<div className="flex justify-between">
							<span>តម្លៃនៅសល់សរុប:</span>
							<span>{formatNumber(state.totalOpen)}៛</span>
						</div>
						<div className="flex justify-between">
							<span>ទទួលសរុប:</span>
							<span>{formatNumber(state.totalReceive)}៛</span>
						</div>
						<div className="flex justify-between">
							<span>ដកសរុប:</span>
							<span>{formatNumber(state.totalWithdrawal)}៛</span>
						</div>
						<div className="flex justify-between">
							<span>នៅសល់:</span>
							<span>{formatNumber(state.totalRemaining)}៛</span>
						</div>
					</div>
				</div>

				<div className="mt-6 min-h-[80px] border border-slate-300 px-3 py-2 text-[15px] font-medium text-slate-700">
					{state.memo || invoiceRefsText}
				</div>

				<div className="mt-12 grid grid-cols-3 text-center text-[18px] font-bold">
					<div>អ្នកទទួលប្រាក់</div>
					<div>អតិថិជន</div>
					<div>អ្នកគ្រប់គ្រង</div>
				</div>
			</div>
		</div>
	);
}
