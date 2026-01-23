import { MainApi } from "../index";
import type { UserInfo, UserToken } from "@/core/types/entity";

export interface SignInReq {
	username: string;
	password: string;
}

export interface SignUpReq extends SignInReq {
	email: string;
}
export type SignInRes = UserToken & { user: UserInfo };

export enum UserApi {
	SignIn = "/auth/signin",
	SignUp = "/auth/signup",
	Logout = "/auth/logout",
	Refresh = "/auth/refresh",
	User = "/user",
}

class UserService extends MainApi {
	async signin(data: SignInReq) {
		const response = await this.noAuthClient.post<SignInRes>(UserApi.SignIn, { data });
		return response.body;
	}

	async signup(data: SignUpReq) {
		const response = await this.noAuthClient.post<SignInRes>(UserApi.SignUp, { data });
		return response.body;
	}

	async logout() {
		const response = await this.client.get(UserApi.Logout);
		return response.body;
	}

	async findById(id: string) {
		const response = await this.client.get<UserInfo[]>(`${UserApi.User}/${id}`);
		return response.body;
	}
}

export default new UserService();
