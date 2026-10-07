import { Suspense } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Spinner } from "@/components/ui/states";

export const metadata = { title: "Arm" };

export default async function ArmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard level="arm" id={id} />
    </Suspense>
  );
}
