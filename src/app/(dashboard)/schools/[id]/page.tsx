import { Suspense } from "react";
import { Dashboard } from "@/components/Dashboard";
import { Spinner } from "@/components/ui/states";

export const metadata = { title: "School" };

export default async function SchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Spinner />}>
      <Dashboard level="school" id={id} />
    </Suspense>
  );
}
