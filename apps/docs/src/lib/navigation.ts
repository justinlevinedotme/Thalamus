export interface NavItem {
  title: string;
  href: string;
  items?: NavItem[];
}

export const navigation: NavItem[] = [
  { title: "Introduction", href: "/docs" },
  { title: "Getting Started", href: "/docs/getting-started" },
  {
    title: "API Reference",
    href: "/docs/api",
    items: [{ title: "Overview", href: "/docs/api" }],
  },
  {
    title: "Guides",
    href: "/docs/guides",
    items: [{ title: "Overview", href: "/docs/guides" }],
  },
];
