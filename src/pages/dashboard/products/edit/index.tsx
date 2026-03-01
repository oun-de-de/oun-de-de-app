import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import productService from "@/core/api/services/product-service";
import type { UpdateProduct } from "@/core/types/product";
import { Text } from "@/core/ui/typography";
import { toUtcIsoPreferNowIfToday } from "@/core/utils/date-utils";
import { useGetUnitList } from "@/pages/dashboard/settings/hooks/use-settings";
import { ProductForm, type ProductFormData } from "../create/components/product-form";

export default function EditProductPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: units = [] } = useGetUnitList();

	const { data: product, isLoading } = useQuery({
		queryKey: ["product", id],
		queryFn: () => {
			if (!id) throw new Error("Product ID is required");
			return productService.getProductList().then((list) => list.find((p) => p.id === id));
		},
		enabled: !!id,
	});

	const { mutateAsync: updateProduct } = useMutation({
		mutationFn: async (data: Partial<UpdateProduct>) => {
			if (!id) throw new Error("Product ID is required");
			return productService.updateProduct(id, data);
		},
		onSuccess: () => {
			toast.success("Product has been updated successfully");
			navigate("/dashboard/products");
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to update product");
		},
	});

	const handleSubmit = async (data: ProductFormData) => {
		const productDateIso = toUtcIsoPreferNowIfToday(data.date);
		const productData: Partial<UpdateProduct> = {
			name: data.name as string,
			date: productDateIso ?? "",
			refNo: data.refNo as string,
			quantity: Number(data.quantity),
			cost: Number(data.cost),
			price: Number(data.price),
			unitId: data.unitId as string,
			defaultQuantity: Number(data.defaultQuantity ?? 0),
			defaultPrice: Number(data.defaultPrice ?? 0),
		};

		await updateProduct(productData);
	};

	const handleCancel = () => {
		navigate("/dashboard/products");
	};

	const unitOptions = units.map((unit) => ({
		label: unit.name,
		value: unit.id,
	}));

	if (isLoading) {
		return <div className="p-6">Loading...</div>;
	}

	if (!product) {
		return <div className="p-6">Product not found</div>;
	}

	const defaultValues: ProductFormData = {
		...product,
		unitId: product.unit?.id || "",
		date: product.date.split("T")[0],
		defaultQuantity: product.defaultProductSetting?.quantity || 0,
		defaultPrice: product.defaultProductSetting?.price || 0,
	};

	return (
		<div className="flex flex-col h-full p-6 gap-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Text className="font-semibold text-sky-600">Edit Product</Text>
			</div>

			{/* Form */}
			<div className="flex-1 overflow-y-auto">
				<div className="w-full">
					<ProductForm
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						mode="edit"
						showTitle={false}
						unitOptions={unitOptions}
						defaultValues={defaultValues}
					/>
				</div>
			</div>
		</div>
	);
}
