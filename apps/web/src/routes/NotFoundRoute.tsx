/**
 * @file NotFoundRoute.tsx
 * @description 404 Not Found page. Displays when users visit an undefined route
 * or a route that has been removed (like /docs).
 */

import { Link } from "react-router-dom";
import { Home } from "lucide-react";

import Footer from "../components/Footer";
import Header from "../components/Header";
import { Button } from "../components/ui/button";

export default function NotFoundRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-card">
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Link>
        </Button>
      </div>
      <Footer />
    </div>
  );
}
