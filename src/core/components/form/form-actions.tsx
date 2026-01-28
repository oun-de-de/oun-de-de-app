import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button, type ButtonProps } from "@/core/ui/button";
import { cn } from "@/core/utils";

const formActionsVariants = cva("flex items-center gap-2", {
	variants: {
		variant: {
			default: "justify-end border-t pt-4",
			basic: "justify-end",
			spaceBetween: "w-full justify-between",
			stickyFooter: "sticky bottom-0 z-10 justify-end border-t bg-background p-4",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

interface FormActionsProps extends VariantProps<typeof formActionsVariants> {
	submitLabel?: string;
	cancelLabel?: string;
	onCancel?: () => void;
	showCancel?: boolean;
	disableWhenClean?: boolean;
	className?: string;
	submitButtonProps?: Omit<ButtonProps, "type" | "disabled" | "children">;
	cancelButtonProps?: Omit<ButtonProps, "type" | "onClick" | "children">;
}

export function FormActions({
	submitLabel = "Save",
	cancelLabel = "Cancel",
	onCancel,
	showCancel = true,
	disableWhenClean = false,
	className,
	submitButtonProps,
	cancelButtonProps,
	variant,
}: FormActionsProps) {
	const {
		formState: { isSubmitting, isDirty },
	} = useFormContext();

	const isSubmitDisabled = isSubmitting || (disableWhenClean && !isDirty);

	return (
		<div className={cn(formActionsVariants({ variant, className }))}>
			{showCancel && (
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} {...cancelButtonProps}>
					{cancelLabel}
				</Button>
			)}
			<Button type="submit" disabled={isSubmitDisabled} {...submitButtonProps}>
				{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{submitLabel}
			</Button>
		</div>
	);
}
