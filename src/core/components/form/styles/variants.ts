import { cva } from "class-variance-authority";

export const inputVariants = cva("w-full outline-none transition disabled:opacity-50 disabled:cursor-not-allowed", {
	variants: {
		variant: {
			default: "border border-input bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
			filled: "border border-transparent bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2",
			ghost: "bg-transparent border-b border-input rounded-none",
		},
		size: {
			sm: "h-9 px-3 text-sm rounded-lg",
			md: "h-10 px-3 text-sm rounded-xl",
			lg: "h-12 px-4 text-base rounded-2xl",
		},
		state: {
			normal: "",
			error: "border-destructive focus:ring-destructive",
		},
	},
	defaultVariants: { variant: "default", size: "md", state: "normal" },
});

export const selectVariants = inputVariants;

export const textareaVariants = cva(
	"w-full outline-none transition disabled:opacity-50 disabled:cursor-not-allowed resize-none",
	{
		variants: {
			variant: {
				default: "border border-input bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
				filled: "border border-transparent bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2",
				ghost: "bg-transparent border-b border-input rounded-none",
			},
			size: {
				sm: "min-h-[84px] px-3 py-2 text-sm rounded-lg",
				md: "min-h-[96px] px-3 py-2 text-sm rounded-xl",
				lg: "min-h-[120px] px-4 py-3 text-base rounded-2xl",
			},
			state: {
				normal: "",
				error: "border-destructive focus:ring-destructive",
			},
		},
		defaultVariants: { variant: "default", size: "md", state: "normal" },
	},
);
