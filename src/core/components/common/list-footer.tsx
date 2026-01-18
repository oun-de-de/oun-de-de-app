import { cva, type VariantProps } from "class-variance-authority";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";

const listFooterVariants = cva("flex items-center text-xs text-muted-foreground transition-colors", {
	variants: {
		variant: {
			default: "justify-between mt-4",
			compact: "justify-between mt-2 py-1",
			minimal: "justify-end gap-2 mt-2",
			centered: "justify-center mt-4",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

type ListFooterProps = VariantProps<typeof listFooterVariants> & {
	total: number;
	onPrev?: () => void;
	onNext?: () => void;
	className?: string;
	showCount?: boolean;
	showControls?: boolean;
	hasPrev?: boolean;
	hasNext?: boolean;
};

export function ListFooter({
	total,
	onPrev,
	onNext,
	className,
	variant,
	showCount = true,
	showControls = true,
	hasPrev = true,
	hasNext = true,
}: ListFooterProps) {
	const isMinimal = variant === "minimal";

	return (
		<div className={cn(listFooterVariants({ variant, className }))}>
			{showCount && !isMinimal && <span>Total {total}</span>}

			{showControls && (
				<span className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={hasPrev ? onPrev : undefined}
						disabled={!hasPrev}
					>
						<Icon icon="mdi:chevron-left" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={hasNext ? onNext : undefined}
						disabled={!hasNext}
					>
						<Icon icon="mdi:chevron-right" />
					</Button>
				</span>
			)}

			{showCount && isMinimal && <span>{total} items</span>}
		</div>
	);
}
