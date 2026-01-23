import { useState } from "react";
import styled from "styled-components";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/core/ui/collapsible";
import { DateFilter, CustomerFilter, EmployeeFilter, WarehouseFilter, SaleCategoryFilter } from "../filters";
import { Icon } from "@/core/components/icon";
import dayjs from "dayjs";

type DateRangeValue = { from?: string; to?: string };
type FormState = {
	date: DateRangeValue;
	customer: string;
	employee: string;
	warehouse: string;
	saleCategory: string;
};

export default function SaleLeftCollapsible() {
	const [formData, setFormData] = useState<FormState>({
		date: { from: dayjs().format("DD/MM/YYYY"), to: dayjs().format("DD/MM/YYYY") },
		customer: "",
		employee: "",
		warehouse: "",
		saleCategory: "",
	});

	return (
		<Collapsible>
			<TopRow>
				<FilterRow>
					<DateFilter
						mode="range"
						value={formData.date}
						format="DD/MM/YYYY"
						onChange={(value) => setFormData((prev) => ({ ...prev, date: value as DateRangeValue }))}
					/>
					<CustomerFilter
						value={formData.customer}
						onChange={(value) => setFormData((prev) => ({ ...prev, customer: value }))}
					/>
				</FilterRow>

				<MoreButton>
					<Icon icon="mdi:plus" size={16} />
					More
				</MoreButton>
			</TopRow>

			<ExpandedFilters>
				<EmployeeFilter
					value={formData.employee}
					onChange={(value) => setFormData((prev) => ({ ...prev, employee: value }))}
				/>

				<WarehouseFilter
					value={formData.warehouse}
					onChange={(value) => setFormData((prev) => ({ ...prev, warehouse: value }))}
				/>

				<SaleCategoryFilter
					value={formData.saleCategory}
					onChange={(value) => setFormData((prev) => ({ ...prev, saleCategory: value }))}
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
