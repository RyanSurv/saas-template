import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SubscriptionButton } from "@/components/subscription-button";
import { checkSubscription } from "@/lib/subscription";

export default async function DashboardPage() {
  const isPro = await checkSubscription();

  return (
    <div className="container py-20">
      <SubscriptionButton>
        {isPro ? "Manage Billing" : "Subscribe"}
      </SubscriptionButton>

      <div className="mt-10 grid gap-5 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
