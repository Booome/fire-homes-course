"use client";

import { useAuth } from "@/components/AuthProvider";
import { PagePagination } from "@/components/PagePagination";
import { PropertyFilter, usePropertyFilter } from "@/components/PropertyFilter";
import { PropertyStatusBadge } from "@/components/PropertyStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cardClasses,
  cardContentClasses,
  cardTitleClasses,
} from "@/lib/consts";
import { Property } from "@/lib/types";
import { CirclePlusIcon, EyeIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import numeral from "numeral";
import { useEffect, useRef, useState } from "react";
import { InjectTestData } from "./InjectTestData";
import { PageBreadcrumb } from "./PageBreadcrumb";

export default function Page() {
  const breadcrumbItems = [{ name: "Dashboard", href: "/admin-dashboard" }];

  return (
    <>
      <PageBreadcrumb items={breadcrumbItems} />
      <PageCard />
    </>
  );
}

function PageCard() {
  return (
    <Card className={cardClasses}>
      <CardHeader>
        <CardTitle className={cardTitleClasses}>Admin Dashboard</CardTitle>
      </CardHeader>

      <CardContent className={cardContentClasses}>
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
  const { dbClient } = useAuth();
  const searchParams = useSearchParams();
  const itemsPerPage = 20;
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const { propertyFilter } = usePropertyFilter();
  const containerRef = useRef<HTMLDivElement>(null);

  const page = Number(searchParams.get("page") ?? 1);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    if (containerRef.current && searchParams.get("page")) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const fetchProperties = async () => {
      const response = await dbClient?.models.Property.list({ limit: 1000 });

      const filteredProperties = (
        response?.data.map((property) => ({
          ...property,
          images: property.images ? JSON.parse(property.images as string) : [],
        })) as Property[]
      ).filter(propertyFilter);

      setProperties(filteredProperties);
      setTotalPages(Math.ceil(filteredProperties.length / itemsPerPage));
    };
    fetchProperties();
  }, [dbClient, propertyFilter]);

  return (
    <div ref={containerRef}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Address</TableHead>
            <TableHead className="text-center">Bedrooms</TableHead>
            <TableHead className="text-center">Bathrooms</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {properties.slice(startIndex, endIndex).map((property) => {
            const address = `${property.addressLine1}, ${property.addressLine2}, ${property.city}, ${property.postcode}`;

            return (
              <TableRow key={property.id}>
                <TableCell>{address}</TableCell>
                <TableCell className="text-center">
                  {property.bedrooms}
                </TableCell>
                <TableCell className="text-center">
                  {property.bathrooms}
                </TableCell>
                <TableCell className="text-right">
                  {numeral(property.price).format("$0,0")}
                </TableCell>
                <TableCell className="text-center">
                  <PropertyStatusBadge status={property.status} />
                </TableCell>
                <TableCell className="text-center flex gap-2">
                  <Link href={`/property/${property.id}`} title="View">
                    <EyeIcon className="shadow p-1 rounded-md" />
                  </Link>
                  <Link
                    href={`/admin-dashboard/${property.id}/edit`}
                    title="Edit"
                  >
                    <PencilIcon className="shadow p-1 rounded-md" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <PagePagination className="mt-4" page={page} totalPages={totalPages} />
    </div>
  );
}
