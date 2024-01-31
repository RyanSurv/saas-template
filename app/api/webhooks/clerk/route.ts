import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

import db from "@/lib/db";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  // For testing
  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  // console.log("Webhook body:", body);

  if (eventType === "user.created") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0].email_address;

    let stripeCustomer;

    // Create a new Stripe customer when a Clerk user is created
    try {
      stripeCustomer = await stripe.customers.create({
        email,
      });
    } catch (err) {
      console.error("Error creating Stripe customer:", err);
      return new Response("Error occured", {
        status: 400,
      });
    }

    // Create a new database user when a Clerk user is created
    try {
      await db.user.create({
        data: {
          clerkId: id,
          email,
          stripeCustomerId: stripeCustomer.id,
        },
      });
    } catch (err) {
      console.error("Error creating database user:", err);
      return new Response("Error occured", {
        status: 400,
      });
    }
  }

  return new Response("", { status: 200 });
}
