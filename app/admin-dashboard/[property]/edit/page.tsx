"use client";

import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Property, PropertyStatus } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EditPropertyCard } from "../../EditPropertyCard";
import { PageBreadcrumb } from "../../PageBreadcrumb";

export default function Page() {
  const { property: propertyId } = useParams();
  const breadcrumbItems = [
    { name: "Dashboard", href: "/admin-dashboard" },
    { name: "Edit property", href: `/admin-dashboard/${propertyId}/edit` },
  ];
  const { dbClient } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await dbClient?.models.Property.get({
          id: propertyId as string,
        });
        if (!response?.data) {
          throw new Error("Property not found");
        }

        setProperty({
          ...response.data,
          status: response.data.status as PropertyStatus,
          images: JSON.parse(response.data.images as string),
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch property";
        console.error(errorMessage);
        toast({
          title: "Failed to fetch property",
          description: errorMessage,
        });
      }
    };
    fetchProperty();
  }, [dbClient, propertyId, toast]);

  return (
    <>
      <PageBreadcrumb items={breadcrumbItems} />
      {property && <EditPropertyCard property={property} />}
    </>
  );
}
