import { useEffect, useState } from "react";
import styled from "styled-components";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/core/ui/collapsible";
import { DateFilter, CustomerFilter, EmployeeFilter, WarehouseFilter, SaleCategoryFilter } from "../filters";
import { Icon } from "@/core/components/icon";
import { SaleFilters } from "@/core/domain/sales/entities/sale-filter";

type SaleLeftCollapsibleProps = {
	formSaleFilters: SaleFilters;
	onChange: (filters: SaleFilters) => void;
};

export default function SaleLeftCollapsible({ formSaleFilters, onChange }: SaleLeftCollapsibleProps) {
	const [formData, setFormData] = useState<SaleFilters>(formSaleFilters);

	useEffect(() => {
		setFormData(formSaleFilters);
	}, [formSaleFilters]);

	return (
		<Collapsible className="pt-2">
			<TopRow className="px-2">
				<FilterRow>
					<DateFilter
						mode="single"
						value={formData.date}
						format="DD/MM/YYYY"
						onChange={(value) => onChange({ ...formData, date: value?.toString() })}
					/>
					<CustomerFilter value={formData.customer} onChange={(value) => onChange({ ...formData, customer: value })} />
				</FilterRow>

				<MoreButton>
					<Icon icon="mdi:plus" size={16} />
					More
				</MoreButton>
			</TopRow>

			<ExpandedFilters className="px-2">
				<EmployeeFilter value={formData.employee} onChange={(value) => onChange({ ...formData, employee: value })} />

				<WarehouseFilter value={formData.warehouse} onChange={(value) => onChange({ ...formData, warehouse: value })} />

				<SaleCategoryFilter
					value={formData.saleCategory}
					onChange={(value) => onChange({ ...formData, saleCategory: value })}
				/>
			</ExpandedFilters>
		</Collapsible>
	);
}

//#region Styled Components
const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: center;
`;

const MoreButton = styled(CollapsibleTrigger)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  color: ${({ theme }) => theme.colors.palette.gray[700]};
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 36px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.palette.gray[100]};
  }
`;

const ExpandedFilters = styled(CollapsibleContent)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 12px;
  padding-bottom: 4px;
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
`;
//#endregion
