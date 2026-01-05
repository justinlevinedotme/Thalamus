import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { Navbar } from "@/components/navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <DocsLayout tree={source.pageTree} nav={{ enabled: false }} sidebar={{ collapsible: false }}>
        {children}
      </DocsLayout>
    </>
  );
}
