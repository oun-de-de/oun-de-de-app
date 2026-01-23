import { SaleLayout } from "./components/sale-layout";
import SaleLeftContent from "./components/sale-left-content";
import SaleRightContent from "./components/sale-right-content";
import { useEffect } from "react";

type SaleVariant = "cash-sale" | "invoice";

export default function NewSalePage({ variant }: { variant: SaleVariant }) {
	useEffect(() => {
		console.log("Sale variant:", variant);
	}, []);
	return (
		<div className="h-full flex flex-col flex-1 min-h-0">
			<SaleLayout leftContent={<SaleLeftContent />} rightContent={<SaleRightContent />} />
		</div>
	);
}
