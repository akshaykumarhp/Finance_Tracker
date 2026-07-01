import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import { DesktopSidebar, MobileNav } from "@/components/Sidebar";
import HouseSwitcher from "@/components/HouseSwitcher";
import Onboarding from "@/components/Onboarding";
import ThemeToggle from "@/components/ThemeToggle";
import { signOut } from "@/app/(auth)/actions";

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
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="safe-top sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-ink-200/60 bg-white/80 px-4 pb-3 backdrop-blur-md dark:border-ink-700/60 dark:bg-ink-900/80 md:px-6">
          <HouseSwitcher houses={houses} activeId={house.id} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="text-right text-sm leading-tight text-ink-500">
                Hi,{" "}
                <span className="font-semibold text-ink-800 dark:text-ink-100">
                  {name}
                </span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold uppercase text-white">
                {name.charAt(0)}
              </span>
            </div>
            {/* Sign out lives in the sidebar on desktop; expose it here on mobile. */}
            <form action={signOut} className="md:hidden">
              <button
                className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-8 md:pt-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
