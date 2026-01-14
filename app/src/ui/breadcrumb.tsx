import * as React from "react"
import { Slot as SlotPrimitive } from "radix-ui"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import styled from "styled-components"

import { cn } from "@/utils"

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <StyledBreadcrumbList
      data-slot="breadcrumb-list"
      className={className}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? SlotPrimitive.Slot : StyledBreadcrumbLink

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={className}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <StyledBreadcrumbPage
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={className}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? "/"}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

//#region Styled Components
const StyledBreadcrumbList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  word-break: break-word;
  color: ${({ theme }) => theme.colors.common.black};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};

  @media (min-width: 640px) {
    gap: 0.625rem;
  }
`;

const StyledBreadcrumbLink = styled.a`
  color: ${({ theme }) => theme.colors.common.black};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.common.black};
  }
`;

const StyledBreadcrumbPage = styled.span`
  color: ${({ theme }) => theme.colors.common.black};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;
//#endregion
