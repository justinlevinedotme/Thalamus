/**
 * @file MeLayoutRoute.tsx
 * @description Layout wrapper for the /me hub. Provides the sidebar navigation on desktop
 * and a collapsible drawer on mobile. Requires authentication - redirects to /login if
 * not signed in.
 */

import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import Footer from "../components/Footer";
import Header from "../components/Header";
import MeSidebar from "../components/MeSidebar";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { useAuthStore } from "../store/authStore";

export default function MeLayoutRoute() {
  const { status } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Show nothing while checking auth status
  if (status === "idle" || status === "loading") {
    return null;
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-card">
      <Header fullWidth />
      <div className="flex flex-1">
        {/* Desktop sidebar - hidden on mobile */}
        <aside className="hidden w-64 shrink-0 border-r border-border px-4 md:block">
          <MeSidebar />
        </aside>

        {/* Mobile drawer trigger + Sheet */}
        <div className="border-b border-border px-4 py-2 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border px-4 py-4">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="px-2">
                <MeSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content area */}
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
