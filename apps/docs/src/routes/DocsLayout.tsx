import { Outlet, Link, useLocation } from "react-router-dom";
import { navigation, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const location = useLocation();
  const isActive = location.pathname === item.href;

  return (
    <div>
      <Link
        to={item.href}
        className={cn(
          "block py-1.5 text-sm transition-colors",
          depth > 0 && "pl-4",
          isActive ? "text-accent-brand font-medium" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {item.title}
      </Link>
      {item.items?.map((child) => (
        <NavLink key={child.href} item={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function DocsLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 md:px-6 lg:px-8">
        <aside
          className={cn(
            "fixed top-14 z-30 h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block",
            "overflow-y-auto py-6 pr-6",
            mobileMenuOpen ? "block bg-background" : "hidden md:block"
          )}
        >
          <div className="flex items-center justify-between md:hidden mb-4">
            <span className="font-medium">Navigation</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </aside>

        <main className="relative py-6 lg:py-8">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center gap-2 text-sm text-muted-foreground mb-4"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
