import { Suspense } from "react";
import { LoginPage } from "@/components/fpmt-ui";

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}

