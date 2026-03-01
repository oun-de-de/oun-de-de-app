import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const createProductSettingItem = (
	product: Product,
	values?: Pick<CreateProductSettings, "price" | "quantity">,
): ProductSettingItem => ({
	productId: product.id,
	price: values?.price ?? product.defaultProductSetting?.price ?? product.price ?? 0,
	quantity: values?.quantity ?? product.defaultProductSetting?.quantity ?? 0,
	productName: product.name,
	productRef: product.refNo,
	unitLabel: getUnitLabel(product),
});

const mapExistingSettings = (
	settings: CreateProductSettings[] | undefined,
	productById: Map<string, Product>,
): ProductSettingItem[] =>
	settings?.flatMap((setting) => {
		const product = productById.get(setting.productId);
		return product ? [createProductSettingItem(product, setting)] : [];
	}) ?? [];

const toNumberOrZero = (value: string) => {
	const parsed = Number(value);
	return Number.isNaN(parsed) ? 0 : parsed;
};

const toPayload = (settings: ProductSettingItem[]) =>
	settings.map(({ productId, price, quantity }) => ({ productId, price, quantity }));

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
	const productById = useMemo(() => new Map(products?.map((product) => [product.id, product]) ?? []), [products]);
	const existingProductIds = useMemo(() => new Set(currentSettings?.map((s) => s.productId) || []), [currentSettings]);
	const initialSettings = useMemo(
		() => mapExistingSettings(currentSettings, productById),
		[currentSettings, productById],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setIsInitialized(false);
		setSettings([]);
	}, [customerId]);

	useEffect(() => {
		if (!products || isInitialized || isLoadingSettings) return;
		setSettings(initialSettings);
		setIsInitialized(true);
	}, [products, initialSettings, isInitialized, isLoadingSettings]);

	const availableProducts = useMemo(
		() => products?.filter((p) => !settings.some((s) => s.productId === p.id)) ?? [],
		[products, settings],
	);

	const handleAdd = useCallback((product: Product) => {
		setSettings((prev) => [...prev, createProductSettingItem(product)]);
	}, []);

	const handleRemove = useCallback(
		async (productId: string) => {
			if (existingProductIds.has(productId)) {
				toast.info("Delete product setting is not supported yet");
				return;
			}
			setSettings((prev) => prev.filter((item) => item.productId !== productId));
		},
		[existingProductIds],
	);

	const handleChange = useCallback((productId: string, field: "price" | "quantity", value: string) => {
		setSettings((prev) =>
			prev.map((item) => {
				if (item.productId !== productId) return item;
				return { ...item, [field]: toNumberOrZero(value) };
			}),
		);
	}, []);

	const handleSave = useCallback(async () => {
		if (settings.length === 0) {
			toast.info("No product settings to save");
			return;
		}

		setIsSaving(true);
		try {
			const payload = toPayload(settings);
			await Promise.all(payload.map((setting) => createSetting(setting)));
			toast.success("Product settings saved successfully");
		} catch {
			toast.error("Failed to save product settings");
		} finally {
			setIsSaving(false);
		}
	}, [settings, createSetting]);

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
