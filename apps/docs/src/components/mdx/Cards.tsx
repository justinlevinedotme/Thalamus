import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  href: string;
  children?: React.ReactNode;
}

export function Card({ title, href, children }: CardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group relative rounded-lg border border-border p-6",
        "bg-card hover:bg-accent transition-colors",
        "no-underline"
      )}
    >
      <h3 className="font-semibold text-foreground group-hover:text-accent-brand transition-colors">
        {title}
      </h3>
      {children ? <p className="mt-2 text-sm text-muted-foreground">{children}</p> : null}
    </Link>
  );
}

interface CardsProps {
  children: React.ReactNode;
}

export function Cards({ children }: CardsProps) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 not-prose mt-6">{children}</div>;
}
