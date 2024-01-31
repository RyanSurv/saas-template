export const stripeProSubscription: {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
} = {
  name: "Pro",
  description: "Pro monthly subscription plan",
  price: 1000, // In cents
  currency: "USD",
  interval: "month",
};

export const stripeSubscriptionEndLeeway = 3 * 24 * 60 * 60 * 1000; // 3 days
