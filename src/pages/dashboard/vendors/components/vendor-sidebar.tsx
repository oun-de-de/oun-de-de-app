import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { EntityListItem } from "@/core/components/common";
import { vendorList } from "@/_mock/data/dashboard";

type VendorSidebarProps = {
	activeVendorId: string | null;
	onSelect: (id: string | null) => void;
};

export function VendorSidebar({ activeVendorId, onSelect }: VendorSidebarProps) {
	return (
		<>
			<div className="flex items-center gap-2">
				<Select defaultValue="type">
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Vendor Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="type">Vendor Type</SelectItem>
						<SelectItem value="preferred">Preferred</SelectItem>
						<SelectItem value="standard">Standard</SelectItem>
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

			<div className="mt-4 divide-y divide-border-gray-300">
				{vendorList.map((vendor) => (
					<EntityListItem
						key={vendor.id}
						customer={vendor}
						isActive={vendor.id === activeVendorId}
						onSelect={onSelect}
					/>
				))}
			</div>

			<div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
				<span>Total 150</span>
				<span className="flex items-center gap-1">
					<Icon icon="mdi:chevron-left" />
					<Icon icon="mdi:chevron-right" />
				</span>
			</div>
		</>
	);
}
