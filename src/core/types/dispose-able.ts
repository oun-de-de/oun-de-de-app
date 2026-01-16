/**
 * Interface for objects that need cleanup/disposal
 */
export interface DisposeAble {
	dispose(): void | Promise<void>;
}
