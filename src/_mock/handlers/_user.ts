import { ResultStatus } from "@/core/types/enum";
import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";
import { DB_USER } from "../assets_backup";
import { UserApi } from "@/core/api/services/userService";

// Accept both /api/auth/... and /api/v1/auth/... (optional version segment)
const signIn = http.post(new RegExp(`/api/v1${UserApi.SignIn}`), async () => {
	return HttpResponse.json({
		status: ResultStatus.SUCCESS,
		message: "",
		data: {
			data: DB_USER[0],
			accessToken: { value: faker.string.uuid() },
			refreshToken: { value: faker.string.uuid() },
		},
	});
});

const refresh = http.post(new RegExp(`/api/v1${UserApi.Refresh}`), async ({ request }) => {
	const { refreshToken } = (await request.json()) as Record<string, string>;

	if (!refreshToken) {
		return HttpResponse.json({
			status: 10002,
			message: "Refresh token is required.",
		});
	}

	const user = DB_USER[0];

	return HttpResponse.json({
		status: ResultStatus.SUCCESS,
		message: "",
		data: {
			data: user,
			accessToken: { value: faker.string.uuid() },
			refreshToken: { value: faker.string.uuid() },
		},
	});
});

const signOut = http.post(new RegExp(`/api/v1${UserApi.Logout}`), async ({ request }) => {
	const { refreshToken } = (await request.json()) as Record<string, string>;

	if (!refreshToken) {
		return HttpResponse.json("Refresh token is required.", { status: 400 });
	}

	return HttpResponse.json("Signed out", {
		status: 200,
	});
});

const userList = http.get(new RegExp(`/api/v1${UserApi.User}$`), async () => {
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

export { signIn, signOut, refresh, userList };
