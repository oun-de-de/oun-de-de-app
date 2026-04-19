import { cva, type VariantProps } from "class-variance-authority";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { cn } from "@/core/utils";

const listFooterVariants = cva("flex items-center text-xs text-muted-foreground transition-colors mt-auto", {
	variants: {
		variant: {
			default: "justify-between pt-4",
			compact: "justify-between pt-2 py-1",
			minimal: "justify-end gap-2 pt-2",
			centered: "justify-center pt-4",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

type ListFooterProps = VariantProps<typeof listFooterVariants> & {
	total: number;
	loadedCount?: number;
	currentPage?: number;
	totalPages?: number;
	rangeStart?: number;
	rangeEnd?: number;
	onPrev?: () => void;
	onNext?: () => void;
	prevLabel?: string;
	nextLabel?: string;
	className?: string;
	showCount?: boolean;
	showControls?: boolean;
	hasPrev?: boolean;
	hasNext?: boolean;
	isCollapsed?: boolean;
	pageSize?: number;
	pageSizeOptions?: number[];
	onPageSizeChange?: (size: number) => void;
};

export function ListFooter({
	total,
	loadedCount,
	currentPage,
	totalPages,
	rangeStart,
	rangeEnd,
	onPrev,
	onNext,
	prevLabel = "Previous",
	nextLabel = "Next",
	className,
	variant,
	showCount = true,
	showControls = true,
	hasPrev = true,
	hasNext = true,
	isCollapsed,
	pageSize,
	pageSizeOptions,
	onPageSizeChange,
}: ListFooterProps) {
	const isMinimal = variant === "minimal";
	const shouldShowControls = showControls && (hasPrev || hasNext);
	const shouldShowPageState =
		shouldShowControls && typeof currentPage === "number" && typeof totalPages === "number" && totalPages > 1;
	const shouldShowPageSizeSelector =
		typeof pageSize === "number" && !!pageSizeOptions?.length && typeof onPageSizeChange === "function";
	const summaryText =
		shouldShowPageState && rangeStart && rangeEnd
			? `Showing ${rangeStart}-${rangeEnd} of ${total}`
			: loadedCount && loadedCount < total
				? `Showing ${loadedCount} of ${total}`
				: `Total ${total}`;
	const pageText = shouldShowPageState ? `Page ${currentPage} of ${totalPages}` : null;

	if (isCollapsed) {
		return (
			<div className={cn("flex flex-col items-center gap-1 pt-4 mt-auto", className)}>
				<span className="text-[10px] font-medium">{pageText ?? `${total} total`}</span>
				{shouldShowControls && (
					<span className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={hasPrev ? onPrev : undefined}
							disabled={!hasPrev}
							aria-label={prevLabel}
						>
							<Icon icon="mdi:chevron-left" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={hasNext ? onNext : undefined}
							disabled={!hasNext}
							aria-label={nextLabel}
						>
							<Icon icon="mdi:chevron-right" />
						</Button>
					</span>
				)}
			</div>
		);
	}

	return (
		<div className={cn(listFooterVariants({ variant, className }))}>
			{showCount && !isMinimal && (
				<div className="min-w-0 text-xs font-medium text-slate-600">
					<span>{summaryText}</span>
					{pageText ? <span className="block text-slate-400">{pageText.replace(" of ", "/")}</span> : null}
				</div>
			)}

			<div className="flex items-center gap-2">
				{shouldShowPageSizeSelector && (
					<Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange?.(Number(value))}>
						<SelectTrigger className="h-8 w-[64px] text-xs">
							<SelectValue placeholder={`${pageSize}`} />
						</SelectTrigger>
						<SelectContent>
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={String(size)}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}

				{shouldShowControls && (
					<span className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 shrink-0"
							onClick={hasPrev ? onPrev : undefined}
							disabled={!hasPrev}
							aria-label={prevLabel}
						>
							<Icon icon="mdi:chevron-left" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 shrink-0"
							onClick={hasNext ? onNext : undefined}
							disabled={!hasNext}
							aria-label={nextLabel}
						>
							<Icon icon="mdi:chevron-right" />
						</Button>
					</span>
				)}
			</div>

			{showCount && isMinimal && <span>{summaryText}</span>}
		</div>
	);
}
