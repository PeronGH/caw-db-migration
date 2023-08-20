import type {
  OrderStatus as OldOrderStatus,
  Role as OldRole,
} from "./schema.ts";
import type { OrderStatus, Role } from "@prisma/client/deno/edge.ts";

export const DUMP_PATH = new URL(import.meta.resolve("../dumps")).pathname;

export function oldRoleToNew(oldRole: OldRole): Role {
  switch (oldRole) {
    case "user":
      return "User";
    case "mod":
      return "Mod";
    case "admin":
      return "Admin";
    default:
      throw new Error(`unknown old role: ${oldRole}`);
  }
}

export function oldOrderStatusToNew(
  oldOrderStatus: OldOrderStatus,
): OrderStatus {
  switch (oldOrderStatus) {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      throw new Error(`unknown old order status: ${oldOrderStatus}`);
  }
}

export function getOrThrow<K, V>(map: Map<K, V>, key: K): V {
  const value = map.get(key);
  if (value === undefined) throw new Error(`key "${key}" not found`);
  return value;
}
