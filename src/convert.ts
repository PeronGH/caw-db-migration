import type { Order, User } from "@prisma/client/deno/edge.ts";
import type { Order as OldOrder, User as OldUser } from "./schema.ts";
import { getOrThrow, oldOrderStatusToNew, oldRoleToNew } from "./utils.ts";
import {
  categories,
  modelInProducts,
  models,
  planAndDurationToProductId,
  products,
} from "./defaults.ts";
import { loadJson } from "./json.ts";
import { saveCsv } from "./csv.ts";

const oldUsers = await loadJson<OldUser>("users"),
  oldOrders = await loadJson<OldOrder>("orders");

// convert users

export const users: User[] = oldUsers
  .map(({ key, value }, id) => ({
    id,
    role: oldRoleToNew(value.role),
    name: `user${Math.random().toString(36).slice(2)}`,
    email: key.slice("user:".length),
    phone: null,
    password: null,
    createdAt: new Date(value.createdAt),
    updatedAt: new Date(),
    isBlocked: value.isBlocked,
  }));

const emailToUserId = new Map(
  users.map(({ email, id }) => [email, id]),
);

// merge subscription and order

const subscriptions = oldUsers.flatMap(({ value }) =>
  value.subscriptions.map((s, i, a) => ({
    ...s,
    isCurrent: i === a.length - 1,
  }))
);

const tradeOrderIdToSubscription = new Map(
  subscriptions.map((s) => [s.tradeOrderId, s]),
);

const mergedOrders = oldOrders
  .map(({ key, value }) => ({
    ...value,
    ...getOrThrow(tradeOrderIdToSubscription, key.slice("order:".length)),
  }));

// convert orders

export const orders: Order[] = mergedOrders.flatMap((value) => {
  try {
    return [{
      id: value.tradeOrderId,
      type: "Subscription",
      status: oldOrderStatusToNew(value.status),
      count: value.count,
      amount: value.totalCents * 100, // an old mistake cause it was stored in cents
      startAt: new Date(value.startsAt),
      endAt: new Date(value.endsAt),
      isCurrent: value.isCurrent,
      userId: getOrThrow(emailToUserId, value.email),
      productId: planAndDurationToProductId(
        value.plan,
        value.endsAt - value.startsAt,
      ),
      createdAt: new Date(value.createdAt),
      updatedAt: new Date(value.createdAt),
      rawData: null,
    }];
  } catch {
    console.warn(`convert: order with id ${value.tradeOrderId} is ignored.`);
    return [];
  }
});

// save all in csv

await saveCsv("users", users);
await saveCsv("orders", orders);
await saveCsv("categories", categories);
await saveCsv("modelInProducts", modelInProducts);
await saveCsv("models", models);
await saveCsv("products", products);
