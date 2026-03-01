import { useParams } from "react-router";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { useProductSettingsForm } from "../hooks/use-product-settings-form";
import { AvailableProductsList } from "./available-products-list";
import { SelectedProductsList } from "./selected-products-list";

export function ProductSettingsForm() {
	const { id: customerId } = useParams<{ id: string }>();
	const form = useProductSettingsForm(customerId);

	if (form.isLoading) {
		return <div>Loading settings...</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Text className="font-semibold text-sky-600">Product Settings</Text>
				<Button type="button" onClick={form.handleSave} disabled={form.isSaving}>
					{form.isSaving ? "Saving..." : "Save Settings"}
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<AvailableProductsList products={form.availableProducts} onAdd={form.handleAdd} />
				<div className="md:col-span-2">
					<SelectedProductsList
						settings={form.settings}
						existingProductIds={form.existingProductIds}
						onChange={form.handleChange}
						onRemove={form.handleRemove}
					/>
				</div>
			</div>
		</div>
	);
}
