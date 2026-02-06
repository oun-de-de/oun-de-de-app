import { Text } from "@/core/ui/typography";

export function ReceiptInvoiceTable() {
	return (
		<div className="bg-gray-50 p-2 rounded border border-gray-200">
			<Text className="text-sky-500 font-medium mb-2">Invoice: KHR</Text>
			<div className="overflow-x-auto">
				<table className="w-full text-sm text-left">
					<thead className="text-xs text-gray-700 uppercase bg-gray-100">
						<tr>
							<th className="px-4 py-3">Invoice Date</th>
							<th className="px-4 py-3">Ref No</th>
							<th className="px-4 py-3">Original</th>
							<th className="px-4 py-3">Open</th>
							<th className="px-4 py-3">Received</th>
							<th className="px-4 py-3">Withdrawal</th>
							<th className="px-4 py-3" />
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan={7} className="px-4 py-8 text-center text-gray-500">
								No Data
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
