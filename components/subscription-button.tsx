"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SubscriptionButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  const onSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data = await response.json();

      window.location.href = data.url;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} onClick={onSubscribe}>
      {children}
    </Button>
  );
}
