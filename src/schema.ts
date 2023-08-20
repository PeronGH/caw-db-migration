import { z } from "zod";

// key: user:${email} .subscriptions
export const subscription = z.object({
  startsAt: z.number(),
  endsAt: z.number(),
  plan: z.string(),
  tradeOrderId: z.string(),
});
export type Subscription = z.infer<typeof subscription>;

export const role = z.enum(["user", "mod", "admin"]);
export type Role = z.infer<typeof role>;

// key: user:${email}
export const user = z.object({
  name: z.string(),
  passwordHash: z.string(),
  createdAt: z.number(),
  lastLoginAt: z.number(),
  isBlocked: z.boolean(),
  resetChances: z.number(),
  inviterCode: z.string().optional(),
  invitationCodes: z.string().array(),
  phone: z.string().optional(),
  subscriptions: subscription.array(),
  role,
});
export type User = z.infer<typeof user>;

export const invitationCodeType = z.enum(["club", "team", "normal"]);
export type InvitationCodeType = z.infer<typeof invitationCodeType>;

// key: invitationCode:${code}
export const invitationCode = z.object({
  type: z.string(),
  limit: z.number(),
  inviterEmail: z.string(),
  inviteeEmails: z.string().array(),
  validOrders: z.string().array().optional(),
});
export type InvitationCode = z.infer<typeof invitationCode>;

export type CreateNewInvitationCodeParams = {
  email: string;
  type: InvitationCodeType;
  code?: string;
  limit?: number;
};

export const orderStatus = z.enum(["pending", "paid", "failed", "refunded"]);
export type OrderStatus = z.infer<typeof orderStatus>;

// key: order:${internalOrderId}
export const order = z.object({
  createdAt: z.number(),
  totalCents: z.number().nonnegative(), // 总金额
  plan: z.string(), // 订阅的套餐
  count: z.number(), // 购买数量
  status: orderStatus,
  email: z.string(),
});
export type Order = z.infer<typeof order>;

export const unit = z.enum(["ms", "s", "m", "h", "d"]);
export type Unit = z.infer<typeof unit>;

export const duration = z.union([
  z.string().refine((value) => /^\d+\s(ms|s|m|h|d)$/.test(value), {
    message: "Invalid Duration format. Should be `${number} ${Unit}`.",
  }),
  z.string().refine((value) => /^\d+(ms|s|m|h|d)$/.test(value), {
    message: "Invalid Duration format. Should be `${number}${Unit}`.",
  }),
]);
// Copied from @upstash/ratelimit/src/duration.ts
export type Duration = `${number} ${Unit}` | `${number}${Unit}`;

/**
 * Convert a human readable duration to milliseconds
 */
export function ms(d: Duration): number {
  const match = d.match(/^(\d+)\s?(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`Unable to parse window size: ${d}`);
  }
  const time = parseInt(match[1]);
  const unit = match[2] as Unit;

  switch (unit) {
    case "ms":
      return time;
    case "s":
      return time * 1000;
    case "m":
      return time * 1000 * 60;
    case "h":
      return time * 1000 * 60 * 60;
    case "d":
      return time * 1000 * 60 * 60 * 24;

    default:
      throw new Error(`Unable to parse window size: ${d}`);
  }
}

export const modelLimit = z.object({
  window: duration,
  limit: z.number().nonnegative(),
});
export type ModelLimit = z.infer<typeof modelLimit>;

// key: plan:${planName}
export const plan = z.object({
  prices: z.object({
    monthly: z.number().nonnegative(),
    quarterly: z.number().nonnegative(),
    yearly: z.number().nonnegative(),
  }),
  limits: z.record(modelLimit),
});
export type Plan = z.infer<typeof plan>;
