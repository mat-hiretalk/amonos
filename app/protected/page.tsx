import { CasinoSelectionPage } from "@/components/casino-selection-page";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  return redirect("/pit/77d68c15-5c03-4daa-b3e6-d13437e6cc07");

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <CasinoSelectionPage />
      </div>
    </div>
  );
}
