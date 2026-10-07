import { Suspense } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Spinner } from "@/components/ui/states";

export const metadata = { title: "All schools" };

export default function NetworkPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard level="network" id={null} />
    </Suspense>
  );
}
