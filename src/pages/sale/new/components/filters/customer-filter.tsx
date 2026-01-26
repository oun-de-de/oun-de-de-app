import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { FilterField } from "./filter-field";
import type { CustomerFilter } from "@/core/domain/sales/entities/sale-filter";
import { useCallback } from "react";
import { PromiseBuilder } from "@/core/ui/promise-builder";
import {
	SaleFilterRepositoryImpl,
	type SaleFilterRepository,
} from "@/core/domain/sales/repositories/sale-filter-repository";
import Repository from "@/service-locator";
import { ClearIconButton } from "../button/clear-button";
import { styled } from "styled-components";

interface CustomerFilterProps {
	value?: CustomerFilter;
	onChange: (value?: CustomerFilter) => void;
}

export function CustomerFilter({ value, onChange }: CustomerFilterProps) {
	const repo = Repository.get<SaleFilterRepository>(SaleFilterRepositoryImpl);
	const promise = useCallback(() => repo.getCustomerFilters(), [repo]);
	return (
		<PromiseBuilder<CustomerFilter[]>
			promise={promise}
			builder={(snapshot) => {
				if (snapshot.connectionState === "none" || snapshot.connectionState === "waiting") {
					return (
						<Select disabled value="">
							<SelectTrigger>
								<SelectValue placeholder="Loading..." />
							</SelectTrigger>
						</Select>
					);
				}
				if (snapshot.connectionState === "done" && snapshot.error) {
					return (
						<Select disabled value="">
							<SelectTrigger>
								<SelectValue placeholder="Error" />
							</SelectTrigger>
						</Select>
					);
				}
				const items = snapshot.data ?? [];
				return (
					<FilterField label="Customer" required htmlFor="customer-select">
						<SelectContainer>
							<StyledSelect
								value={value?.id ?? ""}
								onValueChange={(id) => {
									const found = items.find((c) => c.id === id);
									if (found) onChange(found);
								}}
							>
								<SelectTrigger style={{ width: "100%" }} hideIcon={!!value?.id}>
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									{items.map((customer) => (
										<SelectItem key={customer.id} value={customer.id}>
											{customer.name}
										</SelectItem>
									))}
								</SelectContent>
							</StyledSelect>
							{value?.id && (
								<ClearIconButton
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										onChange(undefined);
									}}
									ariaLabel="Clear customer"
									style={{ right: 8 }}
								/>
							)}
						</SelectContainer>
					</FilterField>
				);
			}}
		/>
	);
}

//#region Styled Components
const SelectContainer = styled.div`
	position: relative;
	width: 100%;
`;

const StyledSelect = styled(Select)`
	width: 100%;
	& > [data-slot='select-trigger'] {
		width: 100%;
	}
`;
//#endregion
