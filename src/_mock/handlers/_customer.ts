import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";
import { Customer } from "@/core/types/customer";
import { BasicStatus } from "@/core/types/enum";

const customerList = http.get("/api/customers", async () => {
  const customers: Customer[] = Array.from({ length: 20 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    balance: parseFloat(faker.finance.amount()),
    status: faker.helpers.arrayElement([BasicStatus.ENABLE, BasicStatus.DISABLE]),
    createdAt: faker.date.past().toISOString(),
    avatar: faker.image.avatar(),
  }));

  return HttpResponse.json(customers, { status: 200 });
});

export { customerList };
