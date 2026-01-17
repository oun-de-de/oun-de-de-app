import type { badgeVariants } from "@/core/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export type VendorSummaryItem = {
	id: string;
	label: string;
	value: string | number;
	variant: BadgeVariant;
	icon: string;
};
