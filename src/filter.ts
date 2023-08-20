// This script filters any invalid data in redis.

import type { InvitationCode, Order, User } from "./schema.ts";
import { loadJson, saveJson } from "./json.ts";

let users = await loadJson<User>("users"),
  orders = await loadJson<Order>("orders"),
  invitationCodes = await loadJson<InvitationCode>("invitationCodes");

// user's email must be lower-cased and unique
// references to user's email must be lower-cased too
{
  // user
  const emailLowerCasedUsers = users.map(({ key: email, value }) => ({
    key: email.toLowerCase(),
    value,
  }));

  const filteredUsers = Array.from(
    new Map(
      emailLowerCasedUsers
        .map(({ key: email, value: user }) => [email.toLowerCase(), user]),
    ),
  )
    .map(([key, value]) => ({ key, value }));

  users = filteredUsers;

  console.debug(
    `filter: ${
      users.length - filteredUsers.length
    } users' emails are not unique`,
  );

  // orders
  const emailLowerCasedOrders = orders.map(({ key, value }) => ({
    key,
    value: { ...value, email: value.email.toLowerCase() },
  }));

  orders = emailLowerCasedOrders;

  // invitationCodes
  const emailLowerCasedInvitationCodes = invitationCodes.map((
    { key, value },
  ) => ({
    key,
    value: {
      ...value,
      inviterEmail: value.inviterEmail.toLowerCase(),
      inviteeEmails: value.inviteeEmails.map((email) => email.toLowerCase()),
    },
  }));

  invitationCodes = emailLowerCasedInvitationCodes;
}

// any reference to user's email must be valid
{
  const emails = new Set(users.map(({ key }) => key.slice("user:".length)));
  const invitationCodesToEmails = new Map(
    users.flatMap(({ key: email, value: { invitationCodes } }) =>
      invitationCodes.map((invitationCode) => [invitationCode, email])
    ),
  );

  // orders
  const filteredOrders = orders.filter(({ value }) => emails.has(value.email));

  console.debug(
    `filter: ${
      orders.length - filteredOrders.length
    } orders' emails are invalid`,
  );

  orders = filteredOrders;

  // invitationCodes

  // if inviter email is not present, find it from users
  const fixedInvitationCodes = invitationCodes.map((
    { key, value },
  ) => (value.inviterEmail ? { key, value } : {
    key,
    value: { ...value, inviterEmail: invitationCodesToEmails.get(key) ?? "" },
  }));

  // references to emails must be valid
  const filteredInvitationCodes = fixedInvitationCodes.filter(
    ({ value }) =>
      emails.has(value.inviterEmail) &&
      value.inviteeEmails.every((email) => emails.has(email)),
  );

  console.debug(
    `filter: ${
      invitationCodes.length - filteredInvitationCodes.length
    } invitationCodes' emails are invalid`,
  );

  invitationCodes = filteredInvitationCodes;
}

// every order must have a corresponding subscription
{
  const referencedOrderIds = new Set(
    users.flatMap((u) => u.value.subscriptions).map((s) => s.tradeOrderId),
  );

  const filteredOrders = orders
    .filter(({ key }) => referencedOrderIds.has(key.slice("order:".length)));

  console.debug(
    `filter: ${orders.length - filteredOrders.length} orders are invalid`,
  );

  orders = filteredOrders;
}

// save
await saveJson("users", users);
await saveJson("orders", orders);
await saveJson("invitationCodes", invitationCodes);
