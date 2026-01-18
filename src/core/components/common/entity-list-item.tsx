import { cva, type VariantProps } from "class-variance-authority";
import { memo } from "react";
import type { EntityListItemData } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";

const entityListItemVariants = cva("flex w-full items-center justify-between text-left transition", {
	variants: {
		variant: {
			default: "px-4 py-2",
			compact: "px-2 py-1 text-sm",
			bordered: "border-b border-gray-100 px-4 py-3 first:rounded-t last:border-0 last:rounded-b",
		},
		activeVariant: {
			default: "hover:bg-gray-100",
			highlight: "data-[active=true]:bg-blue-400 data-[active=true]:text-white data-[active=true]:hover:bg-blue-500",
		},
	},
	defaultVariants: {
		variant: "default",
		activeVariant: "highlight",
	},
});

type EntityListItemProps = VariantProps<typeof entityListItemVariants> & {
	entity: EntityListItemData;
	isActive: boolean;
	onSelect: (id: string) => void;
	style?: React.CSSProperties;
	className?: string;
};

export const EntityListItem = memo(function EntityListItem({
	entity,
	isActive,
	onSelect,
	style,
	variant,
	activeVariant,
	className,
}: EntityListItemProps) {
	return (
		<Button
			variant="ghost"
			onClick={() => onSelect(entity.id)}
			data-active={isActive}
			className={cn(entityListItemVariants({ variant, activeVariant, className }))}
			style={style}
		>
			<span className={cn("font-semibold", isActive ? "text-white" : "text-black")}>
				{entity.id} : {entity.name}
			</span>
			<span
				className={cn(
					"text-xs opacity-70",
					isActive ? "text-white" : "text-muted-foreground",
					variant === "compact" && "scale-90",
				)}
			>
				{entity.code}
			</span>
		</Button>
	);
});
