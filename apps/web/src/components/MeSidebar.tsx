/**
 * @file MeSidebar.tsx
 * @description Sidebar navigation component for the /me hub. Displays two always-expanded
 * sections (Workspace and My Account) with ordered navigation links. Shows the PLUS badge
 * for the My Templates link.
 */

import { NavLink } from "react-router-dom";
import {
  CreditCard,
  FileText,
  Key,
  LayoutTemplate,
  Link2,
  Save,
  Settings,
  Shield,
  User,
} from "lucide-react";

import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
};

const workspaceItems: NavItem[] = [
  {
    label: "Files",
    to: "/me/files",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Saved Nodes",
    to: "/me/saved-nodes",
    icon: <Save className="h-4 w-4" />,
  },
  {
    label: "My Templates",
    to: "/me/templates",
    icon: <LayoutTemplate className="h-4 w-4" />,
    badge: (
      <Badge variant="plus" className="ml-auto text-[10px] px-1.5 py-0">
        PLUS
      </Badge>
    ),
  },
  {
    label: "Shared Links",
    to: "/me/shared-links",
    icon: <Link2 className="h-4 w-4" />,
  },
];

const accountItems: NavItem[] = [
  {
    label: "General",
    to: "/me/account/general",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Billing",
    to: "/me/account/billing",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    label: "Security",
    to: "/me/account/security",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    label: "Connections",
    to: "/me/account/connections",
    icon: <Key className="h-4 w-4" />,
  },
  {
    label: "Data & Privacy",
    to: "/me/account/privacy",
    icon: <Settings className="h-4 w-4" />,
  },
];

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="space-y-1">
      <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function MeSidebar() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <NavSection title="Workspace" items={workspaceItems} />
      <NavSection title="My Account" items={accountItems} />
    </div>
  );
}
