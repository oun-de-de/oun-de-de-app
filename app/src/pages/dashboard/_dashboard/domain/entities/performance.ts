import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/ui/badge";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export type PerformanceItem = {
  id: string;
  label: string;
  value: string | number;
  variant: BadgeVariant;
};
