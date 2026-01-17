import { Icon } from "@/core/components/icon";
import { useSettings } from "@/core/store/settingStore";
import { ThemeLayout } from "@/core/types/enum";
import { Button } from "@/core/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import styled from "styled-components";

type NewActionColumn = {
	title: string;
	items: { title: string }[];
};

type NavNewButtonProps = {
	actions?: NewActionColumn[];
};

export function NavNewButton({ actions }: NavNewButtonProps) {
	const { themeLayout } = useSettings();
	const isMini = themeLayout === ThemeLayout.Mini;

	if (!actions || actions.length === 0) {
		return null;
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<StyledButton variant="outline" size="sm" $isMini={isMini}>
					<Icon icon="lucide:plus" size={16} />
					{!isMini && "New"}
				</StyledButton>
			</PopoverTrigger>
			<PopoverContent side="bottom" align="start" className="p-4 w-auto">
				<StyledPopoverGrid>
					{actions.map((column) => (
						<StyledPopoverColumn key={column.title}>
							<StyledPopoverHeading>{column.title}</StyledPopoverHeading>
							<StyledPopoverList>
								{column.items.map((item, index) => (
									<StyledPopoverItem key={index}>
										<StyledPopoverButton>{item.title}</StyledPopoverButton>
									</StyledPopoverItem>
								))}
							</StyledPopoverList>
						</StyledPopoverColumn>
					))}
				</StyledPopoverGrid>
			</PopoverContent>
		</Popover>
	);
}

//#region Styled Components
const StyledButton = styled(Button)<{ $isMini: boolean }>`
	width: 100%;
	height: 42px;
	margin-bottom: 8px;
	background-color: transparent;
	border-color: ${({ theme }) => theme.colors.common.white};
	color: ${({ theme }) => theme.colors.common.white};
	font-size: 0.875rem;
	font-weight: 500;
	justify-content: center;

	&:hover {
		background-color: ${({ theme }) => theme.colors.common.white};
		color: ${({ theme }) => theme.colors.palette.gray[800]};
		border-color: ${({ theme }) => theme.colors.common.white};
	}
`;

const StyledPopoverGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1.5rem;
`;

const StyledPopoverColumn = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	min-width: 160px;
`;

const StyledPopoverHeading = styled.div`
	font-weight: 600;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.colors.common.black};
	margin-bottom: 0.25rem;
`;

const StyledPopoverList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 0;
`;

const StyledPopoverItem = styled.li`
	padding: 0;
	margin: 0;
`;

const StyledPopoverButton = styled.button`
	display: block;
	width: 100%;
	padding: 0.5rem 0.75rem;
	color: ${({ theme }) => theme.colors.common.black};
	text-decoration: none;
	font-size: 0.875rem;
	border-radius: 0.25rem;
	transition: background-color 0.2s ease;
	background-color: transparent;
	border: none;
	text-align: left;
	cursor: pointer;

	&:hover {
		background-color: ${({ theme }) => theme.colors.palette.gray[200]};
	}
`;
//#endregion
