import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import db from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    return new NextResponse("Webhook error", { status: 400 });
  }

  // Extract the object from the event.
  const dataObject: any = event.data.object;
  console.log(`Recieved Stripe webhook with event type: ${event.type}`);
  console.log(`Recieved Stripe webhook with body: ${event.data.object}`);

  switch (event.type) {
    case "invoice.payment_succeeded":
      if (!dataObject?.subscription_details?.metadata?.userClerkId) {
        return new NextResponse("User Clerk ID is required", { status: 400 });
      }

      if (dataObject["billing_reason"] == "subscription_create") {
        // The subscription automatically activates after successful payment
        // Set the payment method used to pay the first invoice
        // as the default payment method for that subscription
        const subscription_id = dataObject["subscription"];
        const payment_intent_id = dataObject["payment_intent"];

        // Retrieve the payment intent used to pay the subscription
        const payment_intent = await stripe.paymentIntents.retrieve(
          payment_intent_id
        );

        let subscription: Stripe.Subscription;

        // Retrieve the subscription
        try {
          subscription = await stripe.subscriptions.retrieve(subscription_id);
        } catch (err) {
          console.log(err);
          console.log(
            `⚠️  Failed to retrieve the subscription: ${subscription_id}`
          );
        }

        // Update the subscription with the default payment method
        try {
          await stripe.subscriptions.update(subscription_id, {
            default_payment_method: payment_intent.payment_method as string,
          });

          console.log(
            "Default payment method set for subscription:" +
              payment_intent.payment_method
          );
        } catch (err) {
          console.log(err);
          console.log(
            `⚠️  Failed to update the default payment method for subscription: ${subscription_id}`
          );
        }

        // Update the user with the subscription details
        try {
          await db.user.update({
            where: {
              clerkId: dataObject.subscription_details.metadata.userClerkId,
            },
            data: {
              stripeSubscriptionId: subscription_id,
              stripeCurrentPeriodEnd: new Date(
                subscription!.current_period_end * 1000
              ),
            },
          });
        } catch (err) {
          console.log(err);
          console.log(
            `⚠️  Failed to update the subscription: ${subscription_id}`
          );
        }

        console.log(
          `User: ${dataObject.subscription_details.metadata.userClerkId} subscribed with subscription: ${subscription_id}`
        );
      } else if (dataObject["billing_reason"] == "subscription_cycle") {
        const subscription_id = dataObject["subscription"];

        let subscription: Stripe.Subscription;

        // Retrieve the subscription
        try {
          subscription = await stripe.subscriptions.retrieve(subscription_id);
        } catch (err) {
          console.log(err);
          console.log(
            `⚠️  Failed to retrieve the subscription: ${subscription_id}`
          );
        }

        // Update the user with the subscription details
        try {
          await db.user.update({
            where: {
              clerkId: dataObject.subscription_details.metadata.userClerkId,
            },
            data: {
              stripeCurrentPeriodEnd: new Date(
                subscription!.current_period_end * 1000
              ),
            },
          });
        } catch (err) {
          console.log(err);
          console.log(
            `⚠️  Failed to continue the cycle for subscription: ${subscription_id}`
          );
        }

        console.log(
          `User: ${dataObject.subscription_details.metadata.userClerkId} subscription renewed with subscription: ${subscription_id}`
        );
      }

      break;
    case "invoice.payment_failed":
      // If the payment fails or the customer does not have a valid payment method,
      //  an invoice.payment_failed event is sent, the subscription becomes past_due.
      // Use this webhook to notify your user that their payment has
      // failed and to retrieve new card details.
      break;
    case "invoice.finalized":
      // If you want to manually send out invoices to your customers
      // or store them locally to reference to avoid hitting Stripe rate limits.
      break;
    case "customer.subscription.deleted":
      if (event.request != null) {
        // handle a subscription cancelled by your request
        // from above.
      } else {
        // handle subscription cancelled automatically based
        // upon your subscription settings.
      }
      break;
    case "customer.subscription.trial_will_end":
      // Send notification to your user that the trial will end
      break;
    default:
    // Unexpected event type
  }

  return new NextResponse(null, { status: 200 });
}
