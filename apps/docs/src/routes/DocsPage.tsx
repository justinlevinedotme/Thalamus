import { useParams, Navigate, useLocation, Link } from "react-router-dom";
import { type ComponentType, useRef, Fragment } from "react";
import { mdxComponents } from "@/components/mdx";
import { TableOfContents } from "@/components/TableOfContents";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { MDXProps } from "mdx/types";

interface Frontmatter {
  title?: string;
  description?: string;
  toc?: boolean;
}

type MDXModule = {
  default: ComponentType<MDXProps>;
  frontmatter?: Frontmatter;
};

const mdxModules = import.meta.glob<MDXModule>("../../content/docs/**/*.mdx", {
  eager: true,
});

function getPage(slug: string[]): MDXModule | null {
  const path = slug.length === 0 ? "index" : slug.join("/");

  const directKey = `../../content/docs/${path}.mdx`;
  if (mdxModules[directKey]) {
    return mdxModules[directKey];
  }

  const indexKey = `../../content/docs/${path}/index.mdx`;
  if (mdxModules[indexKey]) {
    return mdxModules[indexKey];
  }

  return null;
}

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  parts.forEach((part, index) => {
    const href = "/" + parts.slice(0, index + 1).join("/");
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    crumbs.push({ label, href });
  });

  return crumbs;
}

export function DocsPage() {
  const params = useParams();
  const location = useLocation();
  const contentRef = useRef<HTMLElement>(null);
  const slug = params["*"]?.split("/").filter(Boolean) ?? [];

  const page = getPage(slug);

  if (!page) {
    return <Navigate to="/docs" replace />;
  }

  const MDXContent = page.default;
  const frontmatter = page.frontmatter || {};
  const showToc = frontmatter.toc !== false;
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="flex gap-10">
      <article
        ref={contentRef}
        className="flex-1 min-w-0 prose prose-neutral dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-a:text-accent-brand hover:prose-a:text-accent-brand/80"
      >
        <Breadcrumb className="mb-4 not-prose">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {index < breadcrumbs.length - 1 ? (
                    <Link to={crumb.href} className="transition-colors hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <MDXContent components={mdxComponents} />
      </article>

      {showToc && (
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-20">
            <TableOfContents containerRef={contentRef} />
          </div>
        </aside>
      )}
    </div>
  );
}
