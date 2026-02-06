import { Text } from "@/core/ui/typography";

export function ReceiptFooter() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div>
				<textarea className="w-full border rounded p-2 text-sm min-h-[100px]" placeholder="Memo...." />
			</div>
			<div className="space-y-2 text-sm">
				<div className="flex justify-between items-center">
					<Text className="font-semibold text-gray-600">Total Open Amount:</Text> <Text className="font-bold">0</Text>
				</div>
				<div className="flex justify-between items-center">
					<Text className="font-semibold text-gray-600">Total Discount:</Text> <Text className="font-bold">0</Text>
				</div>
				<div className="flex justify-between items-center">
					<Text className="font-semibold text-gray-600">Total Receive:</Text> <Text className="font-bold">0</Text>
				</div>
				<div className="flex justify-between items-center">
					<Text className="font-semibold text-gray-600">Total Withdrawal:</Text> <Text className="font-bold">0</Text>
				</div>
				<div className="flex justify-between items-center border-t pt-2">
					<Text className="font-bold text-gray-800">Total Remaining:</Text> <Text className="font-bold">0</Text>
				</div>
			</div>
		</div>
	);
}
