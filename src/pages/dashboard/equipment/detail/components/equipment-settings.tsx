import { useState } from "react";
import Icon from "@/core/components/icon/icon";
import type { InventoryItem } from "@/core/types/inventory";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Switch } from "@/core/ui/switch";
import { Text } from "@/core/ui/typography";

type EquipmentSettingsProps = {
	item: InventoryItem;
	onUpdate?: (updatedItem: Partial<InventoryItem>) => void;
};

export function EquipmentSettings({ item, onUpdate }: EquipmentSettingsProps) {
	const [alertThreshold, setAlertThreshold] = useState(item.alertThreshold);
	const [isActive, setIsActive] = useState(true);

	const handleSave = () => {
		if (onUpdate) {
			onUpdate({
				alertThreshold,
			});
		}
	};

	return (
		<div className="space-y-8">
			{/* Item Configuration */}
			<div className="rounded-lg border bg-white p-6 shadow-sm">
				<div className="flex items-center justify-between mb-4 md:mb-6">
					<Text variant="body1" className="font-semibold">
						Item Configuration
					</Text>
				</div>

				<div className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="alert-threshold">Alert Threshold</Label>
						<Input
							id="alert-threshold"
							type="number"
							min="0"
							value={alertThreshold}
							onChange={(e) => setAlertThreshold(Math.max(0, Number(e.target.value)))}
							className="mt-1"
						/>
						<Text variant="caption" className="text-slate-500 mt-1">
							{`You'll be notified when stock falls below this amount`}
						</Text>
					</div>

					<div className="flex items-center justify-between pt-4 border-t">
						<div>
							<Label htmlFor="item-status">Item Status</Label>
							<Text variant="caption" className="text-slate-500">
								{isActive ? "This item is active and available" : "This item is inactive"}
							</Text>
						</div>
						<Switch id="item-status" checked={isActive} onCheckedChange={setIsActive} />
					</div>

					<div className="flex gap-2 pt-4">
						<Button onClick={handleSave}>
							<Icon icon="mdi:check" className="mr-1" />
							Save Changes
						</Button>
						<Button variant="outline">Cancel</Button>
					</div>
				</div>
			</div>

			{/* Danger Zone */}
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm space-x-2">
				<div className="flex flex-col gap-2 mb-4">
					<Text variant="body1" className="font-semibold text-red-900">
						Danger Zone
					</Text>
					<Text variant="body2" className="text-red-700">
						These actions are permanent and cannot be undone
					</Text>
				</div>

				<div className="space-x-4">
					<Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
						<Icon icon="mdi:archive" className="mr-2" />
						Archive This Item
					</Button>
					<Button variant="outline" className="border-red-500 text-red-900 hover:bg-red-100">
						<Icon icon="mdi:delete" className="mr-2" />
						Delete This Item
					</Button>
				</div>
			</div>
		</div>
	);
}
