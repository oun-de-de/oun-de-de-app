import { BehaviorSubject, type Observable } from "rxjs";
import type { ClearAble } from "@/core/interfaces";
import type { DisposeAble } from "@/core/interfaces/dispose-able";
import type { SaleProduct } from "../entities/sale-product";

export interface SaleCartRepository extends DisposeAble, ClearAble {
	readonly itemsStream$: Observable<SaleProduct[]>;

	items(): SaleProduct[];
	addItem(item: SaleProduct): void;
	removeItem(itemId: string | number): void;
}

export class SaleCartRepositoryImpl implements SaleCartRepository {
	private readonly _items = new Map<string | number, SaleProduct>();

	private readonly _itemsSubject = new BehaviorSubject<SaleProduct[]>([]);

	get itemsStream$(): Observable<SaleProduct[]> {
		return this._itemsSubject.asObservable();
	}

	items(): SaleProduct[] {
		return Array.from(this._items.values());
	}

	addItem(item: SaleProduct): void {
		const existing = this._items.get(item.id);
		const qty = (existing?.qty ?? 0) + (item.qty ?? 1);
		this._items.set(item.id, { ...item, qty, amount: item.price * qty });
		this._emit();
	}

	removeItem(itemId: string | number): void {
		this._items.delete(itemId);
		this._emit();
	}

	clear(): void {
		this._items.clear();
		this._emit();
	}

	dispose(): void {
		this._items.clear();
		this._itemsSubject.complete();
	}

	private _emit(): void {
		this._itemsSubject.next(this.items());
	}
}
