import { Link } from "react-router-dom";
import { FolderOpen, LogOut, Settings, Share2, User } from "lucide-react";

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
    <header className="border-b border-slate-200 bg-white px-4 py-4">
      <nav className={`flex items-center justify-between ${fullWidth ? "" : "mx-auto max-w-6xl"}`}>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-semibold text-slate-900">
            Thalamus
          </Link>
          {children}
        </div>
        <div className="flex items-center gap-4">
          {onShare ? (
            <button
              className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
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
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    {user.name && (
                      <span className="text-sm font-medium text-slate-900">{user.name}</span>
                    )}
                    <span className="text-sm text-slate-500">{user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/docs">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    My Graphs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
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
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
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
