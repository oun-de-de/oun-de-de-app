import { cva, type VariantProps } from "class-variance-authority";
import { memo } from "react";
import type { EntityListItemData } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";

const entityListItemVariants = cva(
	"flex w-full min-w-0 items-center justify-between text-left transition cursor-pointer whitespace-nowrap",
	{
		variants: {
			variant: {
				default: "p-3 h-10",
				compact: "p-1 text-sm",
				bordered: "border-b border-gray-100 p-2 first:rounded-t last:border-0 last:rounded-b",
			},
			activeVariant: {
				default: "hover:bg-blue-50",
				highlight: "data-[active=true]:bg-blue-400 data-[active=true]:text-white data-[active=true]:hover:bg-blue-500",
			},
		},
		defaultVariants: {
			variant: "default",
			activeVariant: "highlight",
		},
	},
);

type EntityListItemProps = VariantProps<typeof entityListItemVariants> & {
	entity: EntityListItemData;
	isActive: boolean;
	onSelect: (id: string | null) => void;
	style?: React.CSSProperties;
	className?: string;
	isCollapsed?: boolean;
};

export const EntityListItem = memo(function EntityListItem({
	entity,
	isActive,
	onSelect,
	style,
	variant,
	activeVariant,
	className,
	isCollapsed,
}: EntityListItemProps) {
	if (isCollapsed) {
		return (
			<div style={style} className="flex justify-center">
				<Button
					variant={isActive ? "info" : "outline"}
					size="none"
					onClick={() => onSelect(isActive ? null : entity.id)}
					data-active={isActive}
					className={cn("h-8 w-8 justify-center rounded px-0", className)}
					title={entity.name}
				>
					<span className={cn("font-bold text-sm truncate")}>{entity.name.slice(0, 1)}</span>
				</Button>
			</div>
		);
	}

	return (
		<Button
			variant="secondary"
			onClick={() => onSelect(isActive ? null : entity.id)}
			data-active={isActive}
			className={cn(entityListItemVariants({ variant, activeVariant, className }))}
			style={style}
		>
			<span className={cn("font-semibold", isActive ? "text-white" : "text-black")}>{entity.name}</span>
			<span
				className={cn(
					"hidden md:inline text-xs opacity-70 pr-2",
					isActive ? "text-white" : "text-muted-foreground",
					variant === "compact" && "scale-90",
				)}
			>
				{entity.code}
			</span>
		</Button>
	);
});
