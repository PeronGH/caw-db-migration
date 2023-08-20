import type {
  Category,
  Model,
  ModelInProduct,
  Product,
} from "@prisma/client/deno/edge.ts";

// default values

const monthDuration = 2592000;
const quarterDuration = 7776000;
const yearDuration = 31104000;

export const models: Model[] = [{
  id: 1,
  name: "gpt-3.5-turbo",
  price: 1,
}, {
  id: 2,
  name: "gpt-4",
  price: 10,
}];

export const categories: Category[] = [{
  id: 1,
  name: "月付",
}, {
  id: 2,
  name: "季付",
}, {
  id: 3,
  name: "年付",
}, {
  id: 4,
  name: "次数包",
}];

export const products: Product[] = [{
  id: 1,
  name: "免费会员",
  features: ["可使用 GPT 3.5", "每三小时 10 次"],
  price: 0,
  duration: -1,
}, {
  id: 2,
  name: "初级会员-月付",
  features: ["可使用 GPT 3.5", "不限制使用次数"],
  price: 30,
  duration: monthDuration,
  categoryId: 1,
}, {
  id: 3,
  name: "高级会员-月付",
  features: ["可使用 GPT 3.5/GPT 4", "不限制使用次数"],
  price: 129,
  duration: monthDuration,
  categoryId: 1,
}, {
  id: 4,
  name: "初级会员-季付",
  features: ["可使用 GPT 3.5", "不限制使用次数", "九折优惠"],
  price: 79,
  duration: quarterDuration,
  categoryId: 2,
}, {
  id: 5,
  name: "高级会员-季付",
  features: ["可使用 GPT 3.5/GPT 4", "不限制使用次数", "九折优惠"],
  price: 259,
  duration: quarterDuration,
  categoryId: 2,
}, {
  id: 6,
  name: "初级会员-年付",
  features: ["可使用 GPT 3.5", "不限制使用次数", "八折优惠"],
  price: 329,
  duration: yearDuration,
  categoryId: 3,
}, {
  id: 7,
  name: "高级会员-年付",
  features: ["可使用 GPT 3.5/GPT 4", "不限制使用次数", "八折优惠"],
  price: 999,
  duration: yearDuration,
  categoryId: 3,
}, {
  id: 8,
  name: "GPT3.5次数包",
  features: ["可使用 GPT 3.5"],
  price: 1,
  duration: -1,
  categoryId: 4,
}, {
  id: 9,
  name: "GPT4次数包",
  features: ["可使用 GPT 4"],
  price: 10,
  duration: -1,
  categoryId: 4,
}].map(({ id, name, features, price, duration, categoryId }) => ({
  id,
  name,
  features,
  isHidden: false,
  price,
  stock: -1,
  duration,
  categoryId: categoryId ?? null,
}));

export const modelInProducts: ModelInProduct[] = [
  // 免费
  {
    modelId: 1,
    productId: 1,
    times: 10,
    duration: 10800,
  },
  // 初级
  ...[2, 4, 6].map((productId) => ({
    modelId: 1,
    productId,
    times: 200,
    duration: 3600,
  })),
  // 高级
  ...[3, 5, 7].map((productId) => ({
    modelId: 1,
    productId,
    times: 200,
    duration: 3600,
  })),
  ...[3, 5, 7].map((productId) => ({
    modelId: 2,
    productId,
    times: 200,
    duration: 3600,
  })),
].map(({ times, duration, modelId, productId }) => ({
  times,
  duration,
  modelId,
  productId,
}));

const PLAN_TO_DURATION_TO_PRODUCT_ID: Record<string, Record<number, number>> = {
  "pro": {
    [monthDuration * 1e3]: 2,
    [quarterDuration * 1e3]: 4,
    [yearDuration * 1e3]: 6,
  },
  "premium": {
    [monthDuration * 1e3]: 3,
    [quarterDuration * 1e3]: 5,
    [yearDuration * 1e3]: 7,
  },
};

export function planAndDurationToProductId(
  plan: string,
  duration: number,
): number {
  const productId = PLAN_TO_DURATION_TO_PRODUCT_ID[plan]?.[duration];
  if (productId !== undefined) return productId;
  throw new Error(`plan ${plan} with duration ${duration} is unknown`);
}
