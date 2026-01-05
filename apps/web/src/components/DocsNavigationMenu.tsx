/**
 * @file DocsNavigationMenu.tsx
 * @description Documentation navigation menu dropdown with grid layout showing doc sections
 */

import { BookOpen, Code, Compass, FileText } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { cn } from "@/lib/utils";

const DOCS_BASE_URL = "https://docs.thalamus.sh";

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
    href: `${DOCS_BASE_URL}/docs`,
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Getting Started",
    description: "Quick start guide to create your first diagram.",
    href: `${DOCS_BASE_URL}/docs/getting-started`,
    icon: <Compass className="h-5 w-5" />,
  },
  {
    title: "API Reference",
    description: "Detailed API documentation and endpoints.",
    href: `${DOCS_BASE_URL}/docs/api`,
    icon: <Code className="h-5 w-5" />,
  },
  {
    title: "Guides",
    description: "Tutorials and how-to guides for common tasks.",
    href: `${DOCS_BASE_URL}/docs/guides`,
    icon: <FileText className="h-5 w-5" />,
  },
];

interface ListItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function ListItem({ className, title, icon, children, ...props }: ListItemProps) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

export function DocsNavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-accent data-[state=open]:bg-accent/50">
            Documentation
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {docItems.map((item) => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
