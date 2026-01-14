import * as React from "react"

import { cn } from "@/utils"
import { styled } from "styled-components"
import { rgbAlpha } from "@/utils/theme"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <StyledCard
      data-slot="card"
      className={cn(
        "flex flex-col gap-3 py-3",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header flex items-center justify-center gap-1.5 px-3 has-[data-slot=card-action]:justify-evenly [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-center", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-3", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-3 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

//#region Styled Components
const StyledCard = styled.div`
	background-color: ${({ theme }) => theme.colors.common.white};
  color: ${({ theme }) => theme.colors.common.black};
  border: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[400], 0.4)};
  border-radius: 4px;
`;
//#endregion