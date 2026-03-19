import type { EntityListItemData } from "@/core/types/common";

export type AccountingAccountListItem = EntityListItemData & {
	accountTypeId: string;
	descr?: string;
};
