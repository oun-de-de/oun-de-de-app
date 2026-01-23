import { useMemo, useState } from "react";
import styled from "styled-components";
import SaleLeftCollapsible from "./collapsibles/sale-left-collapsible";
import { ChoiceChips, SearchInput } from "./filters";
import { VirtualProductGrid, type VirtualProduct } from "./list/virtual-product-grid";

const CHIP_OPTIONS = [
	{ label: "NA", value: "na" },
	{ label: "ទឹកកកនឹម", value: "ice-cream" },
	{ label: "ទឹកកកសរសើប", value: "ice-dessert" },
	{ label: "ប្រហុកឡេក", value: "dish-1" },
	{ label: "លីត្រ", value: "liter" },
	{ label: "សំបកបបូរ", value: "shell" },
];

const PRODUCTS: (VirtualProduct & { tags: string[] })[] = [
	{ id: "p-1", name: "ត្រសក់ត្រជាក់", price: 4000, currency: "៛", tags: ["na"] },
	{ id: "p-2", name: "ទឹកកកបកបក់", price: 8000, currency: "៛", tags: ["ice-cream"] },
	{ id: "p-3", name: "ទឹកកកនឹម", price: 14000, currency: "៛", tags: ["ice-dessert"] },
	{ id: "p-4", name: "ទឹកកកអនាម័យ", price: 2400, currency: "៛", tags: ["ice-cream"] },
	{ id: "p-5", name: "យីកាចំណីសត្វ", price: 2600, currency: "៛", tags: ["dish-1"] },
	{ id: "p-6", name: "លីត្រទឹកអំពៅ", price: 3200, currency: "៛", tags: ["liter"] },
	{ id: "p-7", name: "បុប្ផាថ្នាំលាប", price: 1800, currency: "៛", tags: ["shell"] },
	{ id: "p-8", name: "ទឹកដោះគោ", price: 2200, currency: "៛", tags: ["na"] },
	{ id: "p-9", name: "ទឹកប៊ិច", price: 2400, currency: "៛", tags: ["na"] },
	{ id: "p-10", name: "ជ្រលក់បុក", price: 200, currency: "៛", tags: ["dish-1"] },
	{ id: "p-11", name: "កូកាកូឡា", price: 3500, currency: "៛", tags: ["liter"] },
	{ id: "p-12", name: "ទឹកស៊ីត្រោល", price: 2700, currency: "៛", tags: ["na"] },
	{ id: "p-13", name: "ជីកំប៉ុស", price: 5200, currency: "៛", tags: ["shell"] },
	{ id: "p-14", name: "ទឹកកកសាយ", price: 4100, currency: "៛", tags: ["ice-cream"] },
	{ id: "p-15", name: "ទឹកកកព្យួរ", price: 9100, currency: "៛", tags: ["ice-dessert"] },
	{ id: "p-16", name: "ស្ករសម្រេច", price: 4600, currency: "៛", tags: ["na"] },
	{ id: "p-17", name: "ម្សៅលាបជញ្ជាំង", price: 7400, currency: "៛", tags: ["shell"] },
	{ id: "p-18", name: "ទឹកកកបន្ទះ", price: 6200, currency: "៛", tags: ["ice-cream"] },
	{ id: "p-19", name: "ទឹកកកច្របាច់", price: 5800, currency: "៛", tags: ["ice-dessert"] },
	{ id: "p-20", name: "ទឹកជ្រលក់", price: 3300, currency: "៛", tags: ["dish-1"] },
	{ id: "p-21", name: "កាបូបក្រែម", price: 2500, currency: "៛", tags: ["na"] },
	{ id: "p-22", name: "ទឹកកកតូច", price: 1200, currency: "៛", tags: ["ice-cream"] },
	{ id: "p-23", name: "ទឹកកកធំ", price: 5400, currency: "៛", tags: ["ice-cream"] },
	{ id: "p-24", name: "ទឹកកកស្ករគ្រាប់", price: 4400, currency: "៛", tags: ["ice-dessert"] },
	{ id: "p-25", name: "កំប៉ុងទឹកស៊ីឌា", price: 3700, currency: "៛", tags: ["liter"] },
	{ id: "p-26", name: "ទឹកកកបុកចំណី", price: 5100, currency: "៛", tags: ["dish-1"] },
	{ id: "p-27", name: "ទឹកកកខ្នាតតូច", price: 2100, currency: "៛", tags: ["ice-cream"] },
	{ id: "p-28", name: "ទឹកកកកែវ", price: 2900, currency: "៛", tags: ["ice-cream"] },
	{ id: "p-29", name: "ទឹកកកស៊ីត្រេស", price: 3600, currency: "៛", tags: ["ice-dessert"] },
	{ id: "p-30", name: "ទឹកគុជខ្យង", price: 620, currency: "៛", tags: ["shell"] },
];

export default function SaleLeftContent() {
	const [selectedChips, setSelectedChips] = useState<string[]>([]);
	const [search, setSearch] = useState("");

	const filteredItems = useMemo(() => {
		const q = search.trim().toLowerCase();
		return PRODUCTS.filter((item) => {
			const matchesSearch = q ? item.name.toLowerCase().includes(q) : true;
			const matchesChip = selectedChips.length ? selectedChips.some((chip) => item.tags.includes(chip)) : true;
			return matchesSearch && matchesChip;
		});
	}, [search, selectedChips]);

	return (
		<Container>
			<SaleLeftCollapsible />
			<ChoiceChips options={CHIP_OPTIONS} value={selectedChips} onChange={setSelectedChips} />
			<SearchInput value={search} onChange={setSearch} />
			<GridSection>
				<VirtualProductGrid items={filteredItems} height="100%" columns={4} cardHeight={210} />
			</GridSection>
		</Container>
	);
}

//#region Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 4px;
`;

const GridSection = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  width: 100%;
  overflow: hidden;
`;
//#endregion
