import { badgeVariants } from "@/core/ui/badge";
import { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export type CustomerSummaryItem = {
  id: string;
  label: string;
  value: string | number;
  variant: BadgeVariant;
  icon: string;
};
