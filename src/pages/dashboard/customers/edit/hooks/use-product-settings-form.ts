import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import productService from "@/core/api/services/product-service";
import type { CreateProductSettings } from "@/core/types/customer";
import type { Product } from "@/core/types/product";
import {
	useCreateProductSetting,
	useDeleteProductSetting,
	useGetProductSettings,
	useUpdateProductSetting,
} from "../../hooks/use-product-settings";

export interface ProductSettingItem extends CreateProductSettings {
	productName: string;
	productRef: string;
}

const mapToSettingItem = (
	setting: { productId: string; price: number; unit: string; quantity: number },
	product: Product,
): ProductSettingItem => ({
	productId: setting.productId,
	price: setting.price,
	unit: setting.unit,
	quantity: setting.quantity,
	productName: product.name,
	productRef: product.refNo,
});

export const useProductSettingsForm = (customerId?: string) => {
	const { data: products } = useQuery({
		queryKey: ["products-list"],
		queryFn: productService.getProductList,
	});

	const { data: currentSettings, isLoading: isLoadingSettings } = useGetProductSettings(customerId);
	const { mutateAsync: createSetting } = useCreateProductSetting(customerId);
	const { mutateAsync: updateSetting } = useUpdateProductSetting(customerId);
	const { mutateAsync: deleteSetting } = useDeleteProductSetting(customerId);

	const [settings, setSettings] = useState<ProductSettingItem[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setIsInitialized(false);
		setSettings([]);
	}, [customerId]);

	useEffect(() => {
		if (!products || isInitialized || isLoadingSettings) return;

		const initialSettings =
			currentSettings
				?.map((setting) => {
					const product = products.find((p) => p.id === setting.productId);
					return product ? mapToSettingItem(setting, product) : null;
				})
				.filter((item): item is ProductSettingItem => item !== null) ?? [];

		setSettings(initialSettings);
		setIsInitialized(true);
	}, [products, currentSettings, isInitialized, isLoadingSettings]);

	const availableProducts = useMemo(
		() => products?.filter((p) => !settings.some((s) => s.productId === p.id)) ?? [],
		[products, settings],
	);

	const handleAdd = (product: Product) => {
		setSettings((prev) => [
			...prev,
			{
				productId: product.id,
				price: product.price,
				unit: product.unit,
				quantity: 0,
				productName: product.name,
				productRef: product.refNo,
			},
		]);
	};

	const handleRemove = async (productId: string) => {
		const isExisting = currentSettings?.some((s) => s.productId === productId);

		if (isExisting) {
			try {
				await deleteSetting(productId);
				toast.success("Product setting deleted");
			} catch {
				return;
			}
		}

		setSettings((prev) => prev.filter((item) => item.productId !== productId));
	};

	const handleChange = (productId: string, field: "price" | "unit" | "quantity", value: string) => {
		setSettings((prev) =>
			prev.map((item) => {
				if (item.productId !== productId) return item;

				if (field === "unit") {
					return { ...item, unit: value };
				}

				const numValue = Number(value);
				return { ...item, [field]: Number.isNaN(numValue) ? 0 : numValue };
			}),
		);
	};

	const handleSave = async () => {
		if (settings.length === 0) {
			toast.info("No product settings to save");
			return;
		}

		setIsSaving(true);
		try {
			const existingProductIds = new Set(currentSettings?.map((s) => s.productId) || []);

			await Promise.all(
				settings.map(({ productId, price, unit, quantity }) => {
					const settingData = { productId, price, unit, quantity };
					if (existingProductIds.has(productId)) {
						return updateSetting({ productId, setting: settingData });
					}
					return createSetting(settingData);
				}),
			);
			toast.success("Product settings saved successfully");
		} catch {
			toast.error("Failed to save product settings");
		} finally {
			setIsSaving(false);
		}
	};

	return {
		settings,
		availableProducts,
		isLoading: isLoadingSettings && !isInitialized,
		isSaving,
		handleAdd,
		handleRemove,
		handleChange,
		handleSave,
	};
};
