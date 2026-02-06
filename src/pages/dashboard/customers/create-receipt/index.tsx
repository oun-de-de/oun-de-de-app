import { useState } from "react";
import Icon from "@/core/components/icon/icon";
import { Text } from "@/core/ui/typography";
import { ReceiptFooter } from "./components/receipt-footer";
import { ReceiptForm } from "./components/receipt-form";
import { ReceiptInfo } from "./components/receipt-info";
import { ReceiptInvoiceTable } from "./components/receipt-invoice-table";

export default function CreateReceiptPage() {
	const [date, setDate] = useState(() => {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	});

	return (
		<div className="flex flex-col h-full gap-4 p-4 overflow-y-auto">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Icon icon="mdi:plus-circle-outline" className="text-gray-400" />
				<Text variant="subTitle1" className="font-bold">
					Receipt
				</Text>
			</div>

			{/* Content */}
			<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
				<ReceiptForm date={date} setDate={setDate} />
				<ReceiptInfo />
				<ReceiptInvoiceTable />
				<ReceiptFooter />
			</div>
		</div>
	);
}
