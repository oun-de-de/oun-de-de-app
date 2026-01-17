import Icon from "@/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { EntityListItem } from "@/components/common";
import { productList } from "@/_mock/data/dashboard";

type ProductSidebarProps = {
	activeProductId: string | null;
	onSelect: (id: string | null) => void;
};

export function ProductSidebar({ activeProductId, onSelect }: ProductSidebarProps) {
	return (
		<>
			<div className="flex items-center gap-2">
				<Select defaultValue="type">
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Item Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="type">Item Type</SelectItem>
						<SelectItem value="inventory">Inventory</SelectItem>
						<SelectItem value="service">Service</SelectItem>
					</SelectContent>
				</Select>
				<Button variant="outline" size="icon" className="h-9 w-9">
					<Icon icon="mdi:menu" />
				</Button>
			</div>

			<div className="mt-3 flex gap-2">
				<Input placeholder="Search..." />
				<Select defaultValue="active">
					<SelectTrigger className="w-[110px]">
						<SelectValue placeholder="Active" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="inactive">Inactive</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="mt-4 space-y-2">
				{productList.map((item) => (
					<EntityListItem key={item.id} customer={item} isActive={item.id === activeProductId} onSelect={onSelect} />
				))}
			</div>

			<div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
				<span>Total 10</span>
				<span className="flex items-center gap-1">
					<Icon icon="mdi:chevron-left" />
					<Icon icon="mdi:chevron-right" />
				</span>
			</div>
		</>
	);
}
