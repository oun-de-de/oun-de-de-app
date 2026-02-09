import { useParams } from "react-router";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { useProductSettingsForm } from "../hooks/use-product-settings-form";
import { AvailableProductsList } from "./available-products-list";
import { SelectedProductsList } from "./selected-products-list";

export function ProductSettingsForm() {
	const { id: customerId } = useParams<{ id: string }>();
	const { settings, availableProducts, isLoading, isSaving, handleAdd, handleRemove, handleChange, handleSave } =
		useProductSettingsForm(customerId);

	if (isLoading) {
		return <div>Loading settings...</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Text className="font-semibold text-sky-600">Product Settings</Text>
				<Button onClick={handleSave} disabled={isSaving}>
					{isSaving ? "Saving..." : "Save Settings"}
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Left Column: Available Products */}
				<AvailableProductsList products={availableProducts} onAdd={handleAdd} />

				{/* Right Column: Selected Products */}
				<div className="md:col-span-2">
					<SelectedProductsList settings={settings} onChange={handleChange} onRemove={handleRemove} />
				</div>
			</div>
		</div>
	);
}
