import { auth } from "@clerk/nextjs";

import db from "@/lib/db";
import { stripeSubscriptionEndLeeway } from "@/constants";

export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const user = await db.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      stripeCurrentPeriodEnd: true,
    },
  });

  if (!user) {
    return false;
  }

  const isValid =
    user.stripeCurrentPeriodEnd?.getTime()! + stripeSubscriptionEndLeeway >
    Date.now();

  return !!isValid;
};
