import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouse } from "@/lib/house";
import { DesktopSidebar, MobileNav } from "@/components/Sidebar";
import HouseSwitcher from "@/components/HouseSwitcher";
import Onboarding from "@/components/Onboarding";
import ProfileMenu from "@/components/ProfileMenu";

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
          <ProfileMenu name={name} email={user.email ?? ""} />
          {/* Theme toggle, reset password, and sign out all live in the
              profile menu now — available on both mobile and desktop. */}
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-8 md:pt-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
