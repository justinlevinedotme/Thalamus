/**
 * @file Header.tsx
 * @description Application header component with logo, navigation, and user menu dropdown.
 * Shows authentication state and provides quick access to profile, documents, and logout.
 */

import { Link } from "react-router-dom";
import { FolderOpen, LogOut, Settings, Share2, User } from "lucide-react";

import { ThalamusLogo } from "./ThalamusLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuthStore } from "../store/authStore";

type HeaderProps = {
  children?: React.ReactNode;
  fullWidth?: boolean;
  onShare?: () => void;
};

export default function Header({ children, fullWidth = false, onShare }: HeaderProps) {
  const { user, signOut } = useAuthStore();

  return (
    <header className="bg-transparent px-4 py-4">
      <nav className={`flex items-center justify-between ${fullWidth ? "" : "mx-auto max-w-6xl"}`}>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <ThalamusLogo size="md" />
          </Link>
          {children}
        </div>
        <div className="flex items-center gap-4">
          {onShare ? (
            <button
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              type="button"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          ) : null}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary text-muted-foreground transition hover:bg-secondary/80"
                  type="button"
                  aria-label="Profile menu"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center gap-3 px-2 py-2">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    {user.name && (
                      <span className="text-sm font-medium text-foreground">{user.name}</span>
                    )}
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/me/files">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    My Graphs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/me/account/general">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
