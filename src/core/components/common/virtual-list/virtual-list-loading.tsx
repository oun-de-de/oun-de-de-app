import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, isValidElement, cloneElement } from "react";
import styled from "styled-components";

export function VirtualListLoading({
	count,
	renderItem,
	estimateSize = 50,
	className,
	height = "100%",
	overscan = 5,
}: {
	count: number;
	renderItem: (style: React.CSSProperties, index: number) => React.ReactNode;
	estimateSize?: number;
	className?: string;
	height?: string | number;
	overscan?: number;
}) {
	const parentRef = useRef<HTMLDivElement>(null);
	const rowVirtualizer = useVirtualizer({
		count,
		getScrollElement: () => parentRef.current,
		estimateSize: () => estimateSize,
		overscan,
	});

	return (
		<VirtualListContainer ref={parentRef} className={className} $height={height}>
			<InnerContainer $height={rowVirtualizer.getTotalSize()}>
				{rowVirtualizer.getVirtualItems().map((virtualItem) => {
					const style: React.CSSProperties = {
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: `${virtualItem.size}px`,
						transform: `translateY(${virtualItem.start}px)`,
					};
					const rendered = renderItem(style, virtualItem.index);
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
		</VirtualListContainer>
	);
}

const VirtualListContainer = styled.div<{ $height: string | number }>`
  height: ${({ $height }) => (typeof $height === "number" ? `${$height}px` : $height)};
  overflow-y: auto;
  contain: strict;
  padding-right: 2px;
  scrollbar-width: none;

  &:hover {
    scrollbar-width: thin;
  }

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  &:hover::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.palette.gray[300]};
    border-radius: 9px;
    border: 1px solid transparent;
    background-clip: content-box;
  }

  &::-webkit-scrollbar-thumb:hover,
  &::-webkit-scrollbar-thumb:active {
    background-color: ${({ theme }) => theme.colors.palette.gray[300]};
  }

  [data-theme-mode="dark"] &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.palette.gray[600]};
  }
  [data-theme-mode="dark"] &::-webkit-scrollbar-thumb:hover,
  [data-theme-mode="dark"] &::-webkit-scrollbar-thumb:active {
    background-color: ${({ theme }) => theme.colors.palette.gray[600]};
  }
`;

const InnerContainer = styled.div<{ $height: number }>`
  height: ${({ $height }) => $height}px;
  width: calc(100% - 12px);
  position: relative;
`;
