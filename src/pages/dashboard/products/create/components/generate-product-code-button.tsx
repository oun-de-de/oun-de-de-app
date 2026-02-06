import { useMutation } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import productService from "@/core/api/services/product-service";
import { Icon } from "@/core/components/icon";
import { Button } from "@/core/ui/button";

export function GenerateProductCodeButton() {
	const { setValue } = useFormContext();

	const { mutate: generateCode, isPending } = useMutation({
		mutationFn: async () => {
			const products = await productService.getProductList();
			return products;
		},
		onSuccess: (products) => {
			let nextCode = "PRO000001";
			if (products.length > 0) {
				// Find max code
				const maxCode = products.reduce((max, product) => {
					const refNo = product.refNo || "";
					if (refNo.startsWith("PRO")) {
						const numPart = Number.parseInt(refNo.replace("PRO", ""), 10);
						return !Number.isNaN(numPart) && numPart > max ? numPart : max;
					}
					return max;
				}, 0);

				if (maxCode > 0) {
					nextCode = `PRO${(maxCode + 1).toString().padStart(6, "0")}`;
				}
			}
			setValue("refNo", nextCode, { shouldValidate: true, shouldDirty: true });
		},
		onError: (error) => {
			console.error("Failed to generate code", error);
			toast.error("Failed to generate code. Please try again.");
		},
	});

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-500 hover:text-sky-600 disabled:opacity-50"
			onClick={() => generateCode()}
			disabled={isPending}
			title="Generate Next Code"
		>
			<Icon
				icon={isPending ? "eos-icons:loading" : "mdi:refresh"}
				className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
			/>
		</Button>
	);
}
