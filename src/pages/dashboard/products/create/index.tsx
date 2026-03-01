import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import productService from "@/core/api/services/product-service";
import type { CreateProductRequest } from "@/core/types/product";
import { Text } from "@/core/ui/typography";
import { useGetUnitList } from "@/pages/dashboard/settings/hooks/use-settings";
import { ProductForm, type ProductFormData } from "./components/product-form";

export default function CreateProductPage() {
	const navigate = useNavigate();
	const { data: units = [] } = useGetUnitList();

	const { mutateAsync: createProduct } = useMutation({
		mutationFn: async (data: CreateProductRequest) => {
			return productService.createProduct(data);
		},
		onSuccess: () => {
			toast.success("Product has been created successfully");
			navigate("/dashboard/products");
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to create product");
		},
	});

	const handleSubmit = async (data: ProductFormData) => {
		const productData: CreateProductRequest = {
			name: data.name as string,
			unitId: data.unitId as string,
			defaultQuantity: Number(data.defaultQuantity ?? 0),
			defaultPrice: Number(data.defaultPrice ?? 0),
		};

		await createProduct(productData);
	};

	const handleCancel = () => {
		navigate("/dashboard/products");
	};

	const unitOptions = units.map((unit) => ({
		label: unit.name,
		value: unit.id,
	}));

	return (
		<div className="flex flex-col h-full p-6 gap-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Text className="font-semibold text-sky-600">Create New Product</Text>
			</div>

			{/* Form */}
			<div className="flex-1 overflow-y-auto">
				<div className="w-full">
					<ProductForm
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						mode="create"
						showTitle={false}
						unitOptions={unitOptions}
					/>
				</div>
			</div>
		</div>
	);
}
