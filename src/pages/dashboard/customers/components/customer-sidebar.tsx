import Icon from "@/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { EntityListItem } from "@/components/common";
import { customerList } from "@/_mock/data/dashboard";

type CustomerSidebarProps = {
	activeCustomerId: string | null;
	onSelect: (id: string | null) => void;
};

export function CustomerSidebar({ activeCustomerId, onSelect }: CustomerSidebarProps) {
	return (
		<>
			<div className="flex items-center gap-2">
				<Select defaultValue="type">
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Customer Type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="type">Customer Type</SelectItem>
						<SelectItem value="vip">VIP</SelectItem>
						<SelectItem value="retail">Retail</SelectItem>
					</SelectContent>
				</Select>
				<Button variant="outline" size="icon" className="h-9 w-9">
					<Icon icon="mdi:menu" color="white" />
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
				{customerList.map((customer) => (
					<EntityListItem
						key={customer.id}
						customer={customer}
						isActive={customer.id === activeCustomerId}
						onSelect={onSelect}
					/>
				))}
			</div>

			<div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
				<span>Total 200</span>
				<span className="flex items-center gap-1">
					<Icon icon="mdi:chevron-left" />
					<Icon icon="mdi:chevron-right" />
				</span>
			</div>
		</>
	);
}
