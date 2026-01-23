import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, isValidElement, cloneElement } from "react";
import styled from "styled-components";

/**
 * Props for the VirtualList component.
 * @template T The type of data items in the list.
 */
type VirtualListProps<T> = {
	/** The array of data items to render. */
	data: T[];
	/**
	 * Function to render each item.
	 * @param item The data item.
	 * @param style The style object containing positioning for virtualization (must be applied to the item).
	 */
	renderItem: (item: T, style: React.CSSProperties, index: number) => React.ReactNode;
	/** Estimated height of a single item in pixels. Defaults to 50. */
	estimateSize?: number;
	/** Optional CSS class name for the container. */
	className?: string;
	/** Height of the scrollable container. Defaults to "100%". */
	height?: string | number;
	/** Number of items to render outside the visible area. Defaults to 5. */
	overscan?: number;
};

const VirtualListContainer = styled.div<{ $height: string | number }>`
	height: ${({ $height }) => (typeof $height === "number" ? `${$height}px` : $height)};
	overflow-y: auto;
	contain: strict;
	padding-right: 12px;
	scrollbar-width: none;

	&:hover {
		scrollbar-width: thin;
	}

	/* Custom Scrollbar */
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

	/* Dark mode support depends on how theme is handled. 
	   If theme prop changes based on mode, this updates automatically.
	   If leveraging data-theme-mode attribute: */
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

/**
 * A reusable virtualized list component using @tanstack/react-virtual.
 * efficiently renders large lists by only rendering items currently in the viewport.
 */
export function VirtualList<T>({
	data,
	renderItem,
	estimateSize = 50,
	className,
	height = "100%",
	overscan = 5,
}: VirtualListProps<T>) {
	// Ref for the scroll container
	const parentRef = useRef<HTMLDivElement>(null);

	// Virtualizer instance
	const rowVirtualizer = useVirtualizer({
		count: data.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => estimateSize,
		overscan,
	});

	return (
		<VirtualListContainer ref={parentRef} className={className} $height={height}>
			<InnerContainer $height={rowVirtualizer.getTotalSize()}>
				{rowVirtualizer.getVirtualItems().map((virtualItem) => {
					// The item from the original data array corresponding to this virtual row
					const item = data[virtualItem.index];

					// Absolute positioning is required for virtualization to work correctly.
					// We use transform: translateY() to place the item in the correct vertical position.
					const style: React.CSSProperties = {
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: `${virtualItem.size}px`,
						transform: `translateY(${virtualItem.start}px)`,
					};

					// Render item and ensure a stable key to satisfy React list requirements
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
		</VirtualListContainer>
	);
}
