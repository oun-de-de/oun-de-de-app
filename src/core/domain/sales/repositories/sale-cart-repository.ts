import { BehaviorSubject, Observable } from "rxjs";
import { SaleProduct } from "../entities/sale-product";
import { DisposeAble } from "@/core/interfaces/dispose-able";
import { ClearAble } from "@/core/interfaces";

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
		this._items.set(item.id, item);
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
