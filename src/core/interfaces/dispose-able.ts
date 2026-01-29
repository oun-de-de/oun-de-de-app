/**
 * Interface for objects that need cleanup/disposal
 */
export interface DisposeAble {
	dispose(): void | Promise<void>;
}

export function isDisposeAble(obj: unknown): obj is DisposeAble {
	return (
		typeof obj === "object" && obj !== null && "dispose" in (obj as any) && typeof (obj as any).dispose === "function"
	);
}
