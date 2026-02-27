import type { ReactNode } from "react";
import { MultiStoreProvider, type StoreConfig } from "@/core/ui/store/multi-store-provider";
import { borrowCartBoundStore } from "@/pages/dashboard/borrow/stores/borrow-cart-store";

const borrowCreateStores: StoreConfig[] = [
	{
		name: "borrowCart",
		store: borrowCartBoundStore,
	},
];

interface BorrowCreateProviderProps {
	children: ReactNode;
}

export function BorrowCreateProvider({ children }: BorrowCreateProviderProps) {
	return <MultiStoreProvider stores={borrowCreateStores}>{children}</MultiStoreProvider>;
}
