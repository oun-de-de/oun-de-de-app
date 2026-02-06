import { SplitButton } from "@/core/components/common";
import { useRouter } from "@/routes/hooks";
import { useCustomerLayoutActions, useCustomerLayoutState } from "../stores/customer-layout-store";

export type ActionKey = "create-customer" | "create-invoice" | "create-cash-sale" | "create-receipt";

export type Action = {
	key: ActionKey;
	label: string;
	onClick: () => void;
};

function CustomerButtonActions() {
	const router = useRouter();

	// State
	const { activeActionKey } = useCustomerLayoutState();
	// Actions
	const { setState: updateLayoutState } = useCustomerLayoutActions();

	const allActions: Action[] = [
		{
			key: "create-customer",
			label: "Create Customer",
			onClick: () => router.push("/dashboard/customers/create"),
		},
		{
			key: "create-invoice",
			label: "Create Invoice",
			onClick: () => console.log("Create Invoice clicked"),
		},
		{
			key: "create-cash-sale",
			label: "Create Cash Sale",
			onClick: () => console.log("Create Cash Sale clicked"),
		},
		{
			key: "create-receipt",
			label: "Create Receipt",
			onClick: () => router.push("/dashboard/customers/create-receipt"),
		},
	];

	// Current active action
	const activeAction = allActions.find((a) => a.key === activeActionKey) || allActions[0];
	// Others actions
	const otherActions = allActions.filter((a) => a.key !== activeAction.key);

	return (
		<SplitButton
			mainAction={{
				label: activeAction.label,
				onClick: activeAction.onClick,
			}}
			options={otherActions.map((action) => ({
				label: action.label,
				onClick: () => {
					updateLayoutState({ activeActionKey: action.key });
					action.onClick();
				},
			}))}
			size="sm"
		/>
	);
}

export default CustomerButtonActions;
