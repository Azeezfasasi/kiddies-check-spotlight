"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMe } from "@/lib/api/hooks";
import { hrefFor, readState } from "@/lib/nav";
import { Spinner } from "@/components/ui/states";

/** "/" opens wherever the user's scope starts: the network, or their only school. */
function Landing() {
  const router = useRouter();
  const params = useSearchParams();
  const { data } = useMe();

  useEffect(() => {
    if (data) router.replace(hrefFor(data.landing.level, data.landing.id, readState(params)));
  }, [data, params, router]);

  return <Spinner label="Opening your dashboard" />;
}

export default function Home() {
  return (
    <Suspense fallback={<Spinner />}>
      <Landing />
    </Suspense>
  );
}
