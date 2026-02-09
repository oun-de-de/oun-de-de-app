import { cva } from "class-variance-authority";

export const inputVariants = cva(
	"w-full outline-none transition disabled:opacity-50 disabled:cursor-not-allowed rounded",
	{
		variants: {
			variant: {
				default:
					"border border-gray-300 bg-background focus:border-gray-300 focus:[box-shadow:var(--ids-sem-ring-focus)]",
				filled: "border border-transparent bg-muted focus:border-gray-300 focus:[box-shadow:var(--ids-sem-ring-focus)]",
				ghost: "bg-transparent border-b border-gray-300 rounded-none",
			},
			size: {
				sm: "h-9 px-3 text-sm",
				md: "h-10 px-3 text-sm",
				lg: "h-12 px-4 text-base",
			},
			state: {
				normal: "",
				error: "border-destructive focus:ring-destructive",
			},
		},
		defaultVariants: { variant: "default", size: "sm", state: "normal" },
	},
);

export const selectVariants = inputVariants;

export const textareaVariants = cva(
	"w-full outline-none transition disabled:opacity-50 disabled:cursor-not-allowed resize-none rounded",
	{
		variants: {
			variant: {
				default:
					"border border-gray-300 bg-background focus:border-gray-300 focus:[box-shadow:var(--ids-sem-ring-focus)]",
				filled: "border border-transparent bg-muted focus:border-gray-300 focus:[box-shadow:var(--ids-sem-ring-focus)]",
				ghost: "bg-transparent border-b border-gray-300 rounded-none",
			},
			size: {
				sm: "min-h-[84px] px-3 py-2 text-sm",
				md: "min-h-[96px] px-3 py-2 text-sm",
				lg: "min-h-[120px] px-4 py-3 text-base",
			},
			state: {
				normal: "",
				error: "border-destructive focus:ring-destructive",
			},
		},
		defaultVariants: { variant: "default", size: "sm", state: "normal" },
	},
);
