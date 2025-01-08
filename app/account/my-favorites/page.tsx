"use client";

import { PageLoading } from "@/components/PageLoading";
import { PagePagination } from "@/components/PagePagination";
import { PropertyTable } from "@/components/PropertyTable";
import { toast } from "@/hooks/use-toast";
import {
  deleteFavoriteProperty,
  fetchFavoriteProperties,
} from "@/lib/dataActions";
import { Property } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 30;
  const [totalPages, setTotalPages] = useState(1);
  const page = clamp(Number(searchParams.get("page")) || 1, 1, totalPages);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const properties = await fetchFavoriteProperties();
        setProperties(properties);
        setTotalPages(Math.ceil(properties.length / itemsPerPage));
      } catch (error) {
        console.error(error);
        toast({
          title: "Failed to fetch favorites",
          description: JSON.stringify(error),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setProperties((prev) => prev.filter((it) => it.id !== id));
      await deleteFavoriteProperty(id);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to delete favorite",
        description: JSON.stringify(error),
        variant: "destructive",
      });
    }
  };

  return (
    <section className="w-4/5 max-w-screen-lg mx-auto py-5">
      <h1 className="text-3xl font-bold mb-5">My Favorites</h1>
      <PageLoading loading={loading}>
        <PropertyTable
          properties={properties}
          actionTypes={["view", "delete"]}
          onDelete={handleDelete}
        />
        <PagePagination totalPages={totalPages} page={page} />
      </PageLoading>
    </section>
  );
}
