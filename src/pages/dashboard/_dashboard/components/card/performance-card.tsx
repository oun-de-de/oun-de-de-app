import { Badge } from "@/core/ui/badge";
import { rgbAlpha } from "@/core/utils/theme";
import { styled } from "styled-components";
import { PerformanceItem } from "../../../../../core/domain/dashboard/entities/performance";
import { Skeleton } from "@/core/ui/skeleton";

export function PerformanceLoadingCard() {
    return (
        <>
        {Array.from({ length: 3 }).map((_, idx) => (
            <StyledPerformanceItem
            key={idx}
            className="flex items-center justify-between bg-white"
            >
            <div className="flex items-center gap-3">
                {/* Dot badge */}
                <Skeleton className="h-6 w-1 rounded-sm" />

                {/* Label */}
                <Skeleton className="h-4 w-28 rounded" />
            </div>

            {/* Value badge */}
            <Skeleton className="h-6 w-35 rounded-md" />
            </StyledPerformanceItem>
        ))}
        </>
    );
}

export default function PerformanceCard({ item }: { item: PerformanceItem }) {
    return (
        <StyledPerformanceItem
        key={item.id}
        className="flex items-center justify-between bg-white"
    >
        <div className="flex items-center gap-3">
            <Badge
                variant={item.variant}
                shape="dot"
                className="h-6 w-1 p-0 border-none shadow-none"
                aria-hidden="true"
            />
            <StyledPerformanceItemLabel>{item.label}</StyledPerformanceItemLabel>
        </div>
        <Badge variant={item.variant} className="rounded-md px-2">
            <StyledPerformanceItemValue>{item.value}</StyledPerformanceItemValue>
        </Badge>
    </StyledPerformanceItem>
    );
  }
  
//#region Styled Components
const StyledPerformanceItem = styled.div`
padding: 0.5rem 0;
border-bottom: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[400], 0.4)};
`;
const StyledPerformanceItemLabel = styled.span`
font-size: ${({ theme }) => `${theme.typography.fontSize.default}px`};
font-weight: 600;
color: ${({ theme }) => theme.colors.palette.gray[600]};
`;
const StyledPerformanceItemValue = styled.span`
font-size: ${({ theme }) => `${theme.typography.fontSize.default}px`};
font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
color: ${({ theme }) => theme.colors.common.white};
`;
//#endregion