import { BehaviorSubject, Subject, Observable } from "rxjs";
import type { SaleProduct } from "../entities/sale-product";
import type { Pagination } from "@/core/types/pagination";
import type { DisposeAble } from "@/core/interfaces/dispose-able";
import type { SaleFilters } from "../entities/sale-filter";
import { SaleProductApi } from "@/core/api/services/saleService";
import { AsyncDeduplicator } from "@/core/types/async-deduplicator";
import { ClearAble } from "@/core/interfaces/clear-able";

/**
 * Sale Product Repository interface
 */
export interface SaleProductRepository extends ClearAble, DisposeAble {
	// Streams
	readonly itemStream$: Observable<SaleProduct>;
	readonly clearStream$: Observable<void>;
	readonly refreshStream$: Observable<unknown>;

	// Synchronous cached access
	item(id?: string | number): SaleProduct | undefined;

	// Asynchronous fetch
	getItem(id?: string | number): Promise<SaleProduct>;
	getProducts(params: {
		page: number;
		limit?: number;
		search?: string;
		filters?: SaleFilters;
		categoryIds?: (string | number)[];
	}): Promise<Pagination<SaleProduct>>;

	// Actions
	refresh(identity?: unknown): void;
}

/**
 * Implementation of Sale Product Repository
 */
export class SaleProductRepositoryImpl implements SaleProductRepository {
	private readonly _items = new Map<string | number, SaleProduct>();
	private readonly _asyncDeduplicators = new Map<string | number, AsyncDeduplicator<SaleProduct>>();
	private readonly _itemStreams = new Map<string | number, BehaviorSubject<SaleProduct>>();

	private readonly _clearStreamController = new Subject<void>();
	private readonly _refreshStreamController = new Subject<unknown>();

	constructor(private readonly api: SaleProductApi) {}

	get itemStream$(): Observable<SaleProduct> {
		throw new Error("Use getItemStream(id) to get stream for specific item");
	}

	get clearStream$(): Observable<void> {
		return this._clearStreamController.asObservable();
	}

	get refreshStream$(): Observable<unknown> {
		return this._refreshStreamController.asObservable();
	}

	getItemStream(id?: string | number): Observable<SaleProduct> {
		if (id === undefined) {
			throw new Error("Item ID is required");
		}

		// Get or create BehaviorSubject for this item
		let subject = this._itemStreams.get(id);
		if (!subject) {
			const item = this._items.get(id);
			subject = new BehaviorSubject<SaleProduct>(item ?? ({} as SaleProduct));
			this._itemStreams.set(id, subject);
		}

		return subject.asObservable();
	}

	dispose(): void {
		this._items.clear();
		this._asyncDeduplicators.forEach((deduplicator) => deduplicator.invalidate());
		this._asyncDeduplicators.clear();
		this._itemStreams.forEach((subject) => subject.complete());
		this._itemStreams.clear();
		this._clearStreamController.complete();
		this._refreshStreamController.complete();
	}

	item(id?: string | number): SaleProduct | undefined {
		if (id === undefined) return undefined;

		const item = this._items.get(id);

		if (!item) {
			this.getItem(id);
		}

		return item;
	}

	async getItem(id?: string | number): Promise<SaleProduct> {
		if (id === undefined) {
			throw new Error("Product ID is required");
		}

		let deduplicator = this._asyncDeduplicators.get(id);
		if (!deduplicator) {
			deduplicator = new AsyncDeduplicator<SaleProduct>();
			this._asyncDeduplicators.set(id, deduplicator);
		}

		return deduplicator.fetch((signal) => this._fetchItem(id, signal));
	}

	private async _fetchItem(id: string | number, _signal?: AbortSignal): Promise<SaleProduct> {
		const product = await this.api.getProduct(id);
		this._cacheItems([product]);
		return product;
	}

	async getProducts(params: {
		page: number;
		limit?: number;
		search?: string;
		filters?: SaleFilters;
		categoryIds?: (string | number)[];
	}): Promise<Pagination<SaleProduct>> {
		const pagination = await this.api.getProducts(params);
		this._cacheItems(pagination.list);
		return pagination;
	}

	private _cacheItems(list: SaleProduct[]): void {
		for (const item of list) {
			const existingItem = this._items.get(item.id);

			// Merge with existing item if present, otherwise use new item
			const update = existingItem ? { ...existingItem, ...item } : item;

			this._items.set(item.id, update);

			// Update or create BehaviorSubject for this item
			let subject = this._itemStreams.get(item.id);
			if (subject) {
				subject.next(update);
			} else {
				subject = new BehaviorSubject<SaleProduct>(update);
				this._itemStreams.set(item.id, subject);
			}
		}
	}

	refresh(identity?: unknown): void {
		this._refreshStreamController.next(identity);

		if (identity !== undefined) {
			this.getItem(identity as string | number);
		}
	}

	clear(): void {
		this._items.clear();
		this._asyncDeduplicators.forEach((deduplicator) => deduplicator.invalidate());
		this._asyncDeduplicators.clear();
		this._clearStreamController.next();
	}
}
