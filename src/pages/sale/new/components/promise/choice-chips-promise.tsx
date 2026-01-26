import { useCallback } from "react";
import { PromiseBuilder } from "@/core/ui/promise-builder";
import {
	SaleFilterRepositoryImpl,
	type SaleFilterRepository,
} from "@/core/domain/sales/repositories/sale-filter-repository";
import Repository from "@/service-locator";
import { SaleCategory } from "@/core/domain/sales/entities/sale-category";
import { ChoiceChips } from "../choice-chips/choice-chips";

interface ChoiceChipsPromiseProps {
	value: SaleCategory[];
	onChange: (next: SaleCategory[]) => void;
	className?: string;
}

export default function ChoiceChipsPromise({ value, onChange, className }: ChoiceChipsPromiseProps) {
	const repo = Repository.get<SaleFilterRepository>(SaleFilterRepositoryImpl);
	const promise = useCallback(() => repo.getCategories(), [repo]);

	return (
		<PromiseBuilder<SaleCategory[]>
			promise={promise}
			builder={(snapshot) => {
				if (snapshot.connectionState === "none" || snapshot.connectionState === "waiting") {
					return <div className={className}>Loading...</div>;
				}
				if (snapshot.connectionState === "done" && snapshot.error) {
					return null;
				}
				const options: SaleCategory[] = snapshot.data ?? [];
				return <ChoiceChips options={options} value={value} onChange={onChange} className={className} />;
			}}
		/>
	);
}
