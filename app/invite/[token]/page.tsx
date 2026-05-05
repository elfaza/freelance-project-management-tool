import { Suspense } from "react";
import { InvitePage } from "@/components/fpmt-ui";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function Page({ params }: Props) {
  const { token } = await params;
  return (
    <Suspense>
      <InvitePage token={token} />
    </Suspense>
  );
}

