import { Icon } from "@/core/components/icon";
import { useSettings } from "@/core/store/settingStore";
import { useUserInfo, useUserRoles, useSignOut } from "@/core/services/auth/hooks/use-auth";
import { ThemeLayout } from "@/core/types/enum";
import { rgbAlpha } from "@/core/utils/theme";
import { createTaggedLogger } from "@/core/utils/logger";
import { Button } from "@/core/ui/button";
import { useRouter } from "@/routes/hooks";
import styled from "styled-components";
import AccountDropdown from "../../components/account-dropdown";

const logger = createTaggedLogger("NavVerticalFooter");

export function NavVerticalFooter() {
	const { themeLayout } = useSettings();
	const userInfo = useUserInfo();
	const roles = useUserRoles();
	const signOut = useSignOut();
	const { replace } = useRouter();

	const handleLogout = async () => {
		try {
			await signOut();
			replace("/auth/login");
		} catch (error) {
			logger.error("Logout failed:", error);
			// Still redirect on error
			replace("/auth/login");
		}
	};

	const username = userInfo?.username;
	const avatar = userInfo?.avatar;
	const userRole = roles?.[0] ?? "User";
	const isMini = themeLayout === ThemeLayout.Mini;

	return (
		<StyledFooter $isMini={isMini}>
			{isMini ? (
				<StyledMiniFooter>
					<AccountDropdown />
				</StyledMiniFooter>
			) : (
				<StyledVerticalFooter>
					{avatar ? (
						<StyledAvatar src={avatar} alt={username} />
					) : (
						<StyledAvatarPlaceholder>{username?.[0]?.toUpperCase() || "U"}</StyledAvatarPlaceholder>
					)}
					<StyledUserInfo>
						<StyledUsername>{username}</StyledUsername>
						<StyledUserRole>{userRole}</StyledUserRole>
					</StyledUserInfo>
					<StyledLogoutButton variant="ghost" size="icon" onClick={handleLogout}>
						<Icon icon="lucide:log-out" size={16} />
					</StyledLogoutButton>
				</StyledVerticalFooter>
			)}
		</StyledFooter>
	);
}

//#region Styled Components
const StyledFooter = styled.div<{ $isMini: boolean }>`
	border-top: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[200], 0.2)};
	padding: 0.5rem;
	display: ${({ $isMini }) => ($isMini ? "flex" : "block")};
	flex-direction: ${({ $isMini }) => ($isMini ? "column" : "row")};
	align-items: ${({ $isMini }) => ($isMini ? "center" : "flex-start")};
`;

const StyledMiniFooter = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
`;

const StyledVerticalFooter = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	width: 100%;
`;

const StyledAvatar = styled.img`
	height: 2rem;
	width: 2rem;
	border-radius: 50%;
	object-fit: cover;
`;

const StyledAvatarPlaceholder = styled.div`
	height: 2rem;
	width: 2rem;
	border-radius: 50%;
	background-color: ${({ theme }) => theme.colors.palette.primary.default};
	color: ${({ theme }) => theme.colors.common.white};
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.875rem;
	font-weight: 500;
`;

const StyledUserInfo = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
`;

const StyledUsername = styled.span`
	font-size: 0.875rem;
	font-weight: 500;
	color: ${({ theme }) => theme.colors.text.primary};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const StyledUserRole = styled.span`
	font-size: 0.75rem;
	color: ${({ theme }) => theme.colors.text.secondary};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const StyledLogoutButton = styled(Button)`
	flex-shrink: 0;
`;
//#endregion
