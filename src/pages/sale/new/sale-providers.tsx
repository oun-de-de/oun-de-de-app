import { ReactNode, useMemo } from "react";
import { saleProductsBoundStore } from "./stores/sale-products/sale-products-store";
import { MultiStoreProvider } from "@/core/ui/store/multi-store-provider";

interface DashboardProvidersProps {
	children: ReactNode;
	variant: string;
}

export function SaleProductProviders({ children, variant }: DashboardProvidersProps) {
	const store = useMemo(() => saleProductsBoundStore(variant), [variant]);

	return (
		<MultiStoreProvider
			stores={[
				{
					name: "saleProductsStore",
					store,
				},
			]}
		>
			{children}
		</MultiStoreProvider>
	);
}
