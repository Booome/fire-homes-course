"use client";

import { NewPropertyCard } from "../EditPropertyCard";
import { PageBreadcrumb } from "../PageBreadcrumb";

export default function Page() {
  const breadcrumbItems = [
    { name: "Dashboard", href: "/admin-dashboard" },
    { name: "New property", href: "/admin-dashboard/new-property" },
  ];

  return (
    <>
      <PageBreadcrumb items={breadcrumbItems} />
      <NewPropertyCard />
    </>
  );
}
