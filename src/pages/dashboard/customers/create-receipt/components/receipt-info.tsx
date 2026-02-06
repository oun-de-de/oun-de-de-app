import { Text } from "@/core/ui/typography";

export function ReceiptInfo() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-4">
			<div className="space-y-1">
				<div className="flex justify-between">
					<Text className="font-semibold ">Credit Limit:</Text> <Text className="font-semibold ">0</Text>
				</div>
				<div className="flex justify-between">
					<Text className="font-semibold">Deposit Bal:</Text> <Text className="font-semibold ">0 ($0)</Text>
				</div>
				<div className="flex justify-between">
					<Text className="font-semibold">Invoice Bal:</Text> <Text className="font-semibold">0</Text>
				</div>
			</div>
			<div className="space-y-1 text-right">
				<div className="flex justify-between">
					<Text className="font-semibold">Telephone:</Text> <Text>-</Text>
				</div>
				<div className="flex justify-between">
					<Text className="font-semibold">Address:</Text> <Text>-</Text>
				</div>
				<div className="flex justify-between items-center">
					<Text className="font-bold text-sky-500 text-lg">Total Amount:</Text>{" "}
					<Text className="font-bold text-sky-500 text-lg">0</Text>
				</div>
			</div>
		</div>
	);
}
