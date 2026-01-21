import { UserApi } from "@/core/api/services/userService";
import { ResultStatus } from "@/core/types/enum";
import { convertFlatToTree } from "@/core/utils/tree";
import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";
import { DB_MENU, DB_PERMISSION, DB_ROLE, DB_ROLE_PERMISSION, DB_USER, DB_USER_ROLE } from "../assets_backup";

const signIn = http.post(`/api${UserApi.SignIn}`, async ({ request }) => {
	const { username, password } = (await request.json()) as Record<string, string>;

	const user = DB_USER.find((item) => item.username === username);

	if (!user || user.password !== password) {
		return HttpResponse.json({
			status: 10001,
			message: "Incorrect username or password.",
		});
	}
	// delete password
	const { password: _, ...userWithoutPassword } = user;

	// user role (as role objects)
	const roleObjects = DB_USER_ROLE.filter((item) => item.userId === user.id).map((item) =>
		DB_ROLE.find((role) => role.id === item.roleId),
	);

	// user permissions (as permission objects)
	const permissionObjects = DB_ROLE_PERMISSION.filter((item) =>
		roleObjects.some((role) => role?.id === item.roleId),
	).map((item) => DB_PERMISSION.find((permission) => permission.id === item.permissionId));

	// normalize to code strings for frontend auth model
	const roles = roleObjects.map((r) => r?.code ?? r?.name ?? "").filter(Boolean);
	const permissions = permissionObjects.map((p) => p?.code ?? p?.name ?? "").filter(Boolean);

	const menu = convertFlatToTree(DB_MENU);

	return HttpResponse.json({
		status: ResultStatus.SUCCESS,
		message: "",
		data: {
			user: { ...userWithoutPassword, roles, permissions, menu },
			accessToken: faker.string.uuid(),
			refreshToken: faker.string.uuid(),
		},
	});
});

const refresh = http.post(`/api${UserApi.Refresh}`, async ({ request }) => {
	const { refreshToken } = (await request.json()) as Record<string, string>;

	if (!refreshToken) {
		return HttpResponse.json({
			status: 10002,
			message: "Refresh token is required.",
		});
	}

	// In a real app, validate the refresh token here
	// For mock, just return new tokens with the first user's data
	const user = DB_USER[0];
	const { password: _, ...userWithoutPassword } = user;

	// user role (as role objects)
	const roleObjects = DB_USER_ROLE.filter((item) => item.userId === user.id).map((item) =>
		DB_ROLE.find((role) => role.id === item.roleId),
	);

	// user permissions (as permission objects)
	const permissionObjects = DB_ROLE_PERMISSION.filter((item) =>
		roleObjects.some((role) => role?.id === item.roleId),
	).map((item) => DB_PERMISSION.find((permission) => permission.id === item.permissionId));

	// normalize to code strings for frontend auth model
	const roles = roleObjects.map((r) => r?.code ?? r?.name ?? "").filter(Boolean);
	const permissions = permissionObjects.map((p) => p?.code ?? p?.name ?? "").filter(Boolean);

	const menu = convertFlatToTree(DB_MENU);

	return HttpResponse.json({
		status: ResultStatus.SUCCESS,
		message: "",
		data: {
			user: { ...userWithoutPassword, roles, permissions, menu },
			accessToken: faker.string.uuid(),
			refreshToken: faker.string.uuid(),
		},
	});
});

const userList = http.get("/api/user", async () => {
	return HttpResponse.json(
		Array.from({ length: 10 }).map(() => ({
			fullname: faker.person.fullName(),
			email: faker.internet.email(),
			avatar: faker.image.avatarGitHub(),
			address: faker.location.streetAddress(),
		})),
		{
			status: 200,
		},
	);
});

export { signIn, refresh, userList };
