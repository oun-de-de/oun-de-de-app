import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/core/utils/index";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-blue-400 text-white hover:bg-blue-500",
				destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-500",
				secondary: "border border-blue-400 bg-white text-blue-400 hover:bg-blue-50",
				ghost: "text-blue-400 hover:bg-blue-50",
				link: "text-blue-400 underline-offset-4 hover:underline cursor-pointer",
				linkSecondary: "text-blue-400 underline-offset-4 cursor-pointer",
				contrast: "bg-black text-white dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80",
				success: "bg-green-600 text-white hover:bg-green-700",
				warning: "bg-yellow-500 text-white hover:bg-yellow-600",
				info: "bg-blue-500 text-white hover:bg-blue-600",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
				lg: "h-10 rounded-md px-8",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? SlotPrimitive.Slot : "button";
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
