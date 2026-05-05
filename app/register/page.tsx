import { Suspense } from "react";
import { RegisterPage } from "@/components/fpmt-ui";

export default function Page() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}

