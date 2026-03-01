export interface Employee {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
}

export interface CreateEmployee {
	username: string;
	password?: string;
	reEnteredPassword?: string;
}

export interface UpdateEmployeeProfile {
	firstName?: string;
	lastName?: string;
}
