"use client";

import { useAuth } from "@/components/AuthProvider";
import { PageLoading } from "@/components/PageLoading";
import { PagePagination } from "@/components/PagePagination";
import { PropertyFilter, usePropertyFilter } from "@/components/PropertyFilter";
import { PropertyTable } from "@/components/PropertyTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { fetchAllProperties } from "@/lib/dataActions";
import { Property } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { CirclePlusIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { InjectTestData } from "./InjectTestData";
import { PageBreadcrumb } from "./PageBreadcrumb";

export default function Page() {
  const breadcrumbItems = [{ name: "Dashboard", href: "/admin-dashboard" }];

  return (
    <Suspense>
      <PageBreadcrumb items={breadcrumbItems} />
      <PageCard />
    </Suspense>
  );
}

function PageCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
      </CardHeader>

      <CardContent>
        <NewPropertyButton />
        <InjectTestData />
        <PropertyFilter />
        <PageTable />
      </CardContent>
    </Card>
  );
}

function NewPropertyButton() {
  return (
    <Button
      variant="secondary"
      className="text-base font-semibold tracking-wider uppercase px-3 py-2 w-fit"
    >
      <Link
        href="/admin-dashboard/new-property"
        className="flex flex-row items-center gap-1"
      >
        <CirclePlusIcon className="w-6 h-6" />
        <span>New property</span>
      </Link>
    </Button>
  );
}

function PageTable() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const itemsPerPage = 20;
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const { propertyFilter } = usePropertyFilter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const page = clamp(Number(searchParams.get("page")) || 1, 1, totalPages);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    if (containerRef.current && searchParams.get("page")) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const properties = await fetchAllProperties(); // TODO: filter by database
        const filteredProperties = properties.filter(propertyFilter) || [];

        setProperties(filteredProperties);
        setTotalPages(Math.ceil(filteredProperties.length / itemsPerPage));
      } catch (error) {
        console.error(error);
        toast({
          title: "Failed to fetch properties",
          description: JSON.stringify(error),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.userId, propertyFilter]);

  return (
    <PageLoading loading={loading}>
      <div ref={containerRef}>
        <PropertyTable
          properties={properties.slice(startIndex, endIndex)}
          actionTypes={["view", "edit"]}
        />
        <PagePagination className="mt-4" page={page} totalPages={totalPages} />
      </div>
    </PageLoading>
  );
}
