import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { breadCrubmClasses } from "@/lib/consts";
import { capitalCase } from "change-case";
import Link from "next/link";
import { Fragment } from "react";

type PageBreadcrumbProps = {
  items: {
    name: string;
    href: string;
  }[];
};

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  return (
    <Breadcrumb className={breadCrubmClasses}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.name}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={item.href}>{capitalCase(item.name)}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
