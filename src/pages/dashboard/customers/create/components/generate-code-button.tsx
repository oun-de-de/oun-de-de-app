import { useMutation } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import { Icon } from "@/core/components/icon";
import { Button } from "@/core/ui/button";

export function GenerateCodeButton() {
	const { setValue } = useFormContext();

	const { mutate: generateCode, isPending } = useMutation({
		mutationFn: async () => {
			const response = await customerService.getCustomerList({
				limit: 1,
				sort: "code,desc",
			});
			return response;
		},
		onSuccess: (response) => {
			let nextCode = "CUS000001";
			if (response.list.length > 0) {
				const latestCode = response.list[0].code;

				if (!latestCode) {
					nextCode = "CUS000001";
				} else {
					const match = latestCode.match(/^CUS(\d+)$/);
					if (match) {
						const currentNum = Number.parseInt(match[1], 10);
						const nextNum = currentNum + 1;
						nextCode = `CUS${nextNum.toString().padStart(6, "0")}`;
					} else {
						toast.error(`Latest customer code format is invalid (${latestCode}). Please enter manually.`);
						return;
					}
				}
			}
			setValue("code", nextCode, { shouldValidate: true, shouldDirty: true });
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
