import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import Sidebar from "@/components/Sidebar";
import HouseSwitcher from "@/components/HouseSwitcher";
import Onboarding from "@/components/Onboarding";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { house, houses } = await getActiveHouse();

  // No household yet -> show create/join onboarding.
  if (!house) return <Onboarding />;

  const name =
    (user.user_metadata?.display_name as string) ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <HouseSwitcher houses={houses} activeId={house.id} />
          <span className="hidden text-sm text-slate-500 sm:block">
            Hi, {name}
          </span>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
