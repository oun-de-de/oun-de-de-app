import type { Customer } from "@/core/types/customer";
import { CustomerSidebar } from "../../customers/components/customer-sidebar";

type InvoiceSidebarProps = {
	activeCustomerId: string | null;
	onSelect: (customer: Customer | null) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

export function InvoiceSidebar(props: InvoiceSidebarProps) {
	return <CustomerSidebar {...props} />;
}
