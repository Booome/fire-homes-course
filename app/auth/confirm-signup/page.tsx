"use client";

import { ConfirmSignupCard } from "@/components/ConfirmSignupCard";
import { Card, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return email ? (
    <ConfirmSignupCard email={email} />
  ) : (
    <Card>
      <CardTitle>No email provided</CardTitle>
    </Card>
  );
}
