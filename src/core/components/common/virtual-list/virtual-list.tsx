import { useVirtualizer } from "@tanstack/react-virtual";
import { cloneElement, isValidElement, useRef } from "react";
import styled from "styled-components";
import { useScrollbarGap } from "@/core/hooks/use-scrollbar-gap";

export function VirtualList<T>({
	data,
	renderItem,
	estimateSize = 50,
	gap = 0,
	className,
	height = "100%",
	overscan = 5,
	renderEndBuilder,
	maxItems,
	containment = "layout",
	scrollbarGap: scrollbarGapProp,
}: {
	data: T[];
	renderItem: (item: T, style: React.CSSProperties, index: number) => React.ReactNode;
	estimateSize?: number;
	gap?: number;
	className?: string;
	height?: string | number;
	overscan?: number;
	renderEndBuilder?: () => React.ReactNode;
	/** Limit the number of items to display (e.g., for mobile) */
	maxItems?: number;
	/** CSS contain property value - 'layout' for better reflow performance, 'strict' for full containment */
	containment?: "layout" | "strict";
	/** Gap space reserved for scrollbar (in pixels). Auto-detected if not provided. */
	scrollbarGap?: number;
}) {
	const parentRef = useRef<HTMLDivElement>(null);
	const autoScrollbarGap = useScrollbarGap(6);
	const scrollbarGap = scrollbarGapProp ?? autoScrollbarGap;

	const displayData = maxItems !== undefined ? data.slice(0, maxItems) : data;
	const rowVirtualizer = useVirtualizer({
		count: displayData.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => estimateSize + gap,
		overscan,
	});

	return (
		<VirtualListContainer ref={parentRef} className={className} $height={height} $containment={containment}>
			<InnerContainer $height={rowVirtualizer.getTotalSize()}>
				{rowVirtualizer.getVirtualItems().map((virtualItem) => {
					const item = displayData[virtualItem.index];
					const style: React.CSSProperties = {
						position: "absolute",
						top: 0,
						left: 0,
						width: scrollbarGap > 0 ? `calc(100% - ${scrollbarGap}px)` : "100%",
						transform: `translateY(${virtualItem.start}px)`,
					};
					const rendered = renderItem(item, style, virtualItem.index);
					if (isValidElement(rendered)) {
						return cloneElement(rendered, {
							key: rendered.key ?? virtualItem.key ?? virtualItem.index,
						});
					}
					return (
						<div key={virtualItem.key ?? virtualItem.index} style={style}>
							{rendered}
						</div>
					);
				})}
			</InnerContainer>
			{renderEndBuilder?.()}
		</VirtualListContainer>
	);
}

const VirtualListContainer = styled.div<{ $height: string | number; $containment: "layout" | "strict" }>`
	height: ${({ $height }) => (typeof $height === "number" ? `${$height}px` : $height)};
	overflow-y: auto;
	contain: ${({ $containment }) => $containment};
	scrollbar-width: thin;
	scrollbar-color: ${({ theme }) => theme.colors.palette.gray[300]} transparent;

	&::-webkit-scrollbar {
		width: 6px;
		height: 6px;
		background: transparent;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background-color: ${({ theme }) => theme.colors.palette.gray[300]};
		border-radius: 9px;
	}

	[data-theme-mode="dark"] & {
		scrollbar-color: ${({ theme }) => theme.colors.palette.gray[600]} transparent;
	}

	[data-theme-mode="dark"] &::-webkit-scrollbar-thumb {
		background-color: ${({ theme }) => theme.colors.palette.gray[600]};
	}
`;

const InnerContainer = styled.div<{ $height: number }>`
	height: ${({ $height }) => $height}px;
	width: 100%;
	position: relative;
`;
