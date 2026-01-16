import * as React from "react"
import { Slot as SlotPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/core/utils/index"

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 justify-center border  text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-none bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm [a&]:hover:brightness-110 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40",
        secondary:
          "border-none bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-sm [a&]:hover:brightness-110",
        destructive:
          "border-none bg-gradient-to-r from-destructive to-destructive/80 text-white shadow-sm [a&]:hover:brightness-110 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/80",
        info:
          "border-none bg-gradient-to-r from-info to-info/80 text-white shadow-sm [a&]:hover:brightness-110 focus-visible:ring-info/20 dark:focus-visible:ring-info/40",
        warning:
          "border-none bg-gradient-to-r from-warning to-warning/80 text-white shadow-sm [a&]:hover:brightness-110 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40",
        success:
          "border-none bg-gradient-to-r from-success to-success/80 text-white shadow-sm [a&]:hover:brightness-110 focus-visible:ring-success/20 dark:focus-visible:ring-success/40",
        error:
          "border-none bg-gradient-to-r from-error to-error/80 text-white shadow-sm [a&]:hover:brightness-110 focus-visible:ring-error/20 dark:focus-visible:ring-error/40",
				outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      shape: {
        circle: "rounded-full w-5 h-5 p-0",
        square: "rounded-md",
        dot: "rounded-full w-2 h-2 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "square",
    },
  }
)

function Badge({
  className,
  variant,
  shape,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, shape }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
