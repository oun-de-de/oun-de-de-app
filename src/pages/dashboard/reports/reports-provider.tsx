import type { ReactNode } from "react";
import { MultiStoreProvider, type StoreConfig } from "@/core/ui/store/multi-store-provider";
import { reportsBoundStore } from "./stores/reports-store";

const reportsStores: StoreConfig[] = [
	{
		name: "reports",
		store: reportsBoundStore,
	},
];

interface ReportsProviderProps {
	children: ReactNode;
}

export function ReportsProvider({ children }: ReportsProviderProps) {
	return <MultiStoreProvider stores={reportsStores}>{children}</MultiStoreProvider>;
}
