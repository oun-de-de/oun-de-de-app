import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import productService from "@/core/api/services/product-service";
import type { CreateProduct } from "@/core/types/product";
import { Text } from "@/core/ui/typography";
import { ProductForm, type ProductFormData } from "./components/product-form";

export default function CreateProductPage() {
	const navigate = useNavigate();

	const { mutateAsync: createProduct } = useMutation({
		mutationFn: async (data: CreateProduct) => {
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
		const productData: CreateProduct = {
			name: data.name as string,
			date: data.date as string,
			refNo: data.refNo as string,
			quantity: Number(data.quantity),
			cost: Number(data.cost),
			price: Number(data.price),
			unit: data.unit as string,
		};

		await createProduct(productData);
	};

	const handleCancel = () => {
		navigate("/dashboard/products");
	};

	return (
		<div className="flex flex-col h-full p-6 gap-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Text className="font-semibold text-sky-600">Create New Product</Text>
			</div>

			{/* Form */}
			<div className="flex-1 overflow-y-auto">
				<div className="w-full">
					<ProductForm onSubmit={handleSubmit} onCancel={handleCancel} mode="create" showTitle={false} />
				</div>
			</div>
		</div>
	);
}
