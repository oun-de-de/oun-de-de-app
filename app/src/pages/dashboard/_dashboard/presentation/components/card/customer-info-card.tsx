import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { Icon } from "@/components/icon";
import { styled } from "styled-components";
import { CustomerSummaryItem } from "../../../domain/entities/customer-info";

// Loading skeleton cho Customer Info card
export function CustomerInfoCardLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
            <div
            key={idx}
            className="flex items-center justify-between w-full rounded-md border border-gray-200 px-3 py-2"
            >
            <div className="flex items-center gap-3 h-full">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
                </div>
            </div>
            </div>
        ))}
    </div>
  );
}

export default function CustomerInfoCard({ item }: { item: CustomerSummaryItem }) {
  return (
    <Badge
        key={item.id}
        variant={item.variant}
        shape="square"
        className="flex items-center justify-between w-full p-0 border-none"
    >
        <div className="flex items-center gap-3 h-full">
            <StyledBadgeIconWrapper className="flex h-full w-10 items-center justify-center bg-white/20">
                <Icon icon={item.icon} size={24} />
            </StyledBadgeIconWrapper>
            <div className="flex flex-col py-1">
                <span className="text-lg font-semibold">{item.label}</span>
                <span className="text-lg font-semibold">{item.value}</span>
            </div>
        </div>
    </Badge>
  );
}

//#region Styled Components
const StyledBadgeIconWrapper = styled.div`
    border-left-radius: 6px;
`;
//#endregion
