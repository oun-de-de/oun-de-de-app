import { SplitButton } from "@/core/components/common";
import type { ButtonProps } from "@/core/ui/button";
import { useNavigate } from "react-router";
import type { AccountingCreateOptionLabel } from "../constants";
import { createAccountingCreateOptions } from "../constants";

type AccountingCreateMenuButtonProps = {
	mainAction: {
		label: string;
		onClick: () => void;
	};
	optionLabels: readonly AccountingCreateOptionLabel[];
	size?: "sm" | "default" | "lg" | "icon";
	variant?: ButtonProps["variant"];
	mainButtonClassName?: string;
	triggerButtonClassName?: string;
};

export function AccountingCreateMenuButton({
	mainAction,
	optionLabels,
	size,
	variant,
	mainButtonClassName,
	triggerButtonClassName,
}: AccountingCreateMenuButtonProps) {
	const navigate = useNavigate();

	return (
		<SplitButton
			size={size}
			variant={variant}
			mainAction={mainAction}
			options={createAccountingCreateOptions(optionLabels, navigate)}
			mainButtonClassName={mainButtonClassName}
			triggerButtonClassName={triggerButtonClassName}
		/>
	);
}
