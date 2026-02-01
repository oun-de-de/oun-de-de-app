export interface Employee {
	id: string;
	username: string;
	firstName: string | null;
	lastName: string | null;
}

export interface CreateEmployee {
	code: string;
	name: string;
	status: boolean;
	position: string;
	department: string;
	telephone: string;
	email: string;
	address: string;
	hireDate: string;
	profileUrl: string;
}
