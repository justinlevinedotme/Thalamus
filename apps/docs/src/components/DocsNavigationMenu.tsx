import { Link } from "react-router-dom";
import { Book, BookOpen, Code, Compass, FileText } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { cn } from "@/lib/utils";

interface DocItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const docItems: DocItem[] = [
  {
    title: "Introduction",
    description: "Learn about Thalamus and its core concepts.",
    href: "/docs",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Getting Started",
    description: "Quick start guide to create your first diagram.",
    href: "/docs/getting-started",
    icon: <Compass className="h-5 w-5" />,
  },
  {
    title: "API Reference",
    description: "Detailed API documentation and endpoints.",
    href: "/docs/api",
    icon: <Code className="h-5 w-5" />,
  },
  {
    title: "Guides",
    description: "Tutorials and how-to guides for common tasks.",
    href: "/docs/guides",
    icon: <FileText className="h-5 w-5" />,
  },
];

interface ListItemProps {
  title: string;
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function ListItem({ className, title, href, icon, children }: ListItemProps) {
  return (
    <li>
      <Link
        to={href}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <div className="text-sm font-medium leading-none">{title}</div>
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
      </Link>
    </li>
  );
}

export function DocsNavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-accent data-[state=open]:bg-accent/50">
            <Book className="mr-1.5 h-4 w-4" />
            Docs
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {docItems.map((item) => (
                <ListItem key={item.title} title={item.title} href={item.href} icon={item.icon}>
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
