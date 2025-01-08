"use client";

import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { fetchProperty } from "@/lib/dataActions";
import { Property } from "@/lib/types";
import { use, useEffect, useState } from "react";
import { EditPropertyCard } from "../../EditPropertyCard";
import { PageBreadcrumb } from "../../PageBreadcrumb";

export default function Page({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);
  const breadcrumbItems = [
    { name: "Dashboard", href: "/admin-dashboard" },
    { name: "Edit property", href: `/admin-dashboard/${propertyId}/edit` },
  ];
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setProperty(await fetchProperty(propertyId as string));
      } catch (error) {
        console.error(error);
        toast({
          title: "Failed to fetch property",
          description: JSON.stringify(error),
          variant: "destructive",
        });
      }
    })();
  }, [user?.userId, propertyId, toast]);

  return (
    <>
      <PageBreadcrumb items={breadcrumbItems} />
      {property && <EditPropertyCard property={property} />}
    </>
  );
}
