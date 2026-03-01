import { useLoginStateContext } from "@/pages/sys/login/providers/login-provider";
import userIcon from "@/assets/icons/ic-user.svg";
import { useRouter } from "@/routes/hooks";
import { useUserInfo, useSignOut } from "@/core/services/auth/hooks/use-auth";
import { createTaggedLogger } from "@/core/utils/logger";
import { Button } from "@/core/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import styled from "styled-components";

const logger = createTaggedLogger("AccountDropdown");

/**
 * Account Dropdown
 */
export default function AccountDropdown() {
	const { replace } = useRouter();
	const userInfo = useUserInfo();
	const signOut = useSignOut();
	const { backToLogin } = useLoginStateContext();
	const { t } = useTranslation();
	const username = userInfo?.username?.trim() || userInfo?.user_id || "Unknown user";

	const logout = async () => {
		try {
			await signOut();
			backToLogin();
			replace("/auth/login");
		} catch (error) {
			logger.error("Logout failed:", error);
			replace("/auth/login");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<StyledTriggerButton variant="ghost" size="icon" className="rounded-full">
					<img className="h-6 w-6 rounded-full" src={userIcon} alt="" />
				</StyledTriggerButton>
			</DropdownMenuTrigger>
			<StyledDropdownMenuContent className="w-56">
				<StyledUserInfo>
					<img className="h-10 w-10 rounded-full" src={userIcon} alt="" />
					<div className="flex flex-col items-start">
						<StyledUsername>{username}</StyledUsername>
					</div>
				</StyledUserInfo>
				<DropdownMenuSeparator />
				<StyledDropdownMenuItem asChild>
					<NavLink to="https://docs-admin.slashspaces.com/" target="_blank">
						{t("sys.docs")}
					</NavLink>
				</StyledDropdownMenuItem>
				<StyledDropdownMenuItem asChild>
					<NavLink to="/management/user/profile">{t("sys.nav.user.profile")}</NavLink>
				</StyledDropdownMenuItem>
				<StyledDropdownMenuItem asChild>
					<NavLink to="/management/user/account">{t("sys.nav.user.account")}</NavLink>
				</StyledDropdownMenuItem>
				<DropdownMenuSeparator />
				<StyledDropdownMenuItem className="font-bold text-warning" onClick={logout}>
					{t("sys.login.logout")}
				</StyledDropdownMenuItem>
			</StyledDropdownMenuContent>
		</DropdownMenu>
	);
}

//#region Styled Components
const StyledTriggerButton = styled(Button)`
	&:hover {
		background-color: ${({ theme }) => theme.colors.action.hover};
	}
`;

const StyledDropdownMenuContent = styled(DropdownMenuContent)`
	background-color: ${({ theme }) => theme.colors.common.white};
	box-shadow: ${({ theme }) => theme.shadows.dropdown};
	color: ${({ theme }) => theme.colors.common.black};
`;

const StyledUserInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
`;

const StyledUsername = styled.div`
	color: ${({ theme }) => theme.colors.common.black};
	font-size: 0.875rem;
	font-weight: 500;
`;

const StyledDropdownMenuItem = styled(DropdownMenuItem)`
	color: ${({ theme }) => theme.colors.common.black};

	a {
		color: ${({ theme }) => theme.colors.common.black};
		text-decoration: none;
	}

	&:hover {
		background-color: ${({ theme }) => theme.colors.action.hover};
	}
`;
//#endregion
