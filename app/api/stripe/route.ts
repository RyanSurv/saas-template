import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import db from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { stripeProSubscription } from "@/constants";

const settingsUrl = absoluteUrl("/dashboard");

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!dbUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (dbUser.stripeCustomerId && dbUser.stripeSubscriptionId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: settingsUrl,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer: dbUser.stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: stripeProSubscription.currency,
            product_data: {
              name: stripeProSubscription.name,
              description: stripeProSubscription.description,
            },
            unit_amount: stripeProSubscription.price,
            recurring: {
              interval: stripeProSubscription.interval,
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          userClerkId: userId,
        },
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
