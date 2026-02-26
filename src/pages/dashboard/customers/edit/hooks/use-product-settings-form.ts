import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import productService from "@/core/api/services/product-service";
import type { CreateProductSettings } from "@/core/types/customer";
import type { Product } from "@/core/types/product";
import { useCreateProductSetting, useGetProductSettings } from "../../hooks/use-product-settings";

export interface ProductSettingItem extends CreateProductSettings {
	productName: string;
	productRef: string;
	unitLabel: string;
}

const getUnitLabel = (product: Product): string => product.unit?.name ?? "-";

const mapToSettingItem = (
	setting: { productId: string; price: number; quantity: number },
	product: Product,
): ProductSettingItem => ({
	productId: setting.productId,
	price: setting.price,
	quantity: setting.quantity,
	productName: product.name,
	productRef: product.refNo,
	unitLabel: getUnitLabel(product),
});

export const useProductSettingsForm = (customerId?: string) => {
	const { data: products } = useQuery({
		queryKey: ["products-list"],
		queryFn: productService.getProductList,
	});

	const { data: currentSettings, isLoading: isLoadingSettings } = useGetProductSettings(customerId);
	const { mutateAsync: createSetting } = useCreateProductSetting(customerId);

	const [settings, setSettings] = useState<ProductSettingItem[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
				quantity: 0,
				productName: product.name,
				productRef: product.refNo,
				unitLabel: getUnitLabel(product),
			},
		]);
	};

	const existingProductIds = useMemo(() => new Set(currentSettings?.map((s) => s.productId) || []), [currentSettings]);

	const handleRemove = async (productId: string) => {
		if (existingProductIds.has(productId)) {
			toast.info("Delete product setting is not supported yet");
			return;
		}
		setSettings((prev) => prev.filter((item) => item.productId !== productId));
	};

	const handleChange = (productId: string, field: "price" | "quantity", value: string) => {
		if (existingProductIds.has(productId)) {
			return;
		}
		setSettings((prev) =>
			prev.map((item) => {
				if (item.productId !== productId) return item;

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
			const newSettings = settings.filter((setting) => !existingProductIds.has(setting.productId));
			if (newSettings.length === 0) {
				toast.info("Only create product setting is supported. No new products to save.");
				return;
			}
			await Promise.all(
				newSettings.map(({ productId, price, quantity }) => createSetting({ productId, price, quantity })),
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
		existingProductIds,
		availableProducts,
		isLoading: isLoadingSettings && !isInitialized,
		isSaving,
		handleAdd,
		handleRemove,
		handleChange,
		handleSave,
	};
};
