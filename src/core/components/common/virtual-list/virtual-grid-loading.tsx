import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import styled from "styled-components";

export function VirtualGridLoading({
	count,
	columns,
	renderItem,
	estimateRowHeight = 240,
	className,
	height = "100%",
	overscan = 5,
	gap = 12,
}: {
	count: number;
	columns: number;
	renderItem: (style: React.CSSProperties, index: number) => React.ReactNode;
	estimateRowHeight?: number;
	className?: string;
	height?: string | number;
	overscan?: number;
	gap?: number;
}) {
	const parentRef = useRef<HTMLDivElement>(null);
	const rowCount = Math.ceil(count / columns);
	const rowVirtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => estimateRowHeight + gap,
		overscan,
	});

	return (
		<VirtualListContainer ref={parentRef} className={className} $height={height}>
			<InnerContainer $height={rowVirtualizer.getTotalSize()}>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const style: React.CSSProperties = {
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: `${virtualRow.size - gap}px`,
						transform: `translateY(${virtualRow.start}px)`,
						display: "grid",
						gridTemplateColumns: `repeat(${columns}, 1fr)`,
						gap: `${gap}px`,
					};
					const items = [];
					for (let col = 0; col < columns; col++) {
						const idx = virtualRow.index * columns + col;
						if (idx >= count) break;
						items.push(renderItem({ width: "100%", height: estimateRowHeight }, idx));
					}
					return (
						<div key={virtualRow.key ?? virtualRow.index} style={style}>
							{items}
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
