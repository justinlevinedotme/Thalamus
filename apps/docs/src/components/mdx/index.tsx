import type { ComponentPropsWithoutRef } from "react";
import { Cards, Card } from "./Cards";
import { Callout } from "./Callout";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

function MdxTable(props: ComponentPropsWithoutRef<"table">) {
  return <Table {...props} />;
}

function MdxThead(props: ComponentPropsWithoutRef<"thead">) {
  return <TableHeader {...props} />;
}

function MdxTbody(props: ComponentPropsWithoutRef<"tbody">) {
  return <TableBody {...props} />;
}

function MdxTr(props: ComponentPropsWithoutRef<"tr">) {
  return <TableRow {...props} />;
}

function MdxTh(props: ComponentPropsWithoutRef<"th">) {
  return <TableHead {...props} />;
}

function MdxTd(props: ComponentPropsWithoutRef<"td">) {
  return <TableCell {...props} />;
}

export const mdxComponents = {
  Cards,
  Card,
  Callout,
  table: MdxTable,
  thead: MdxThead,
  tbody: MdxTbody,
  tr: MdxTr,
  th: MdxTh,
  td: MdxTd,
};
