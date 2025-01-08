"use client";

import { useAuth } from "@/components/AuthProvider";
import { PageLoading } from "@/components/PageLoading";
import { PagePagination } from "@/components/PagePagination";
import { PropertyFilter, usePropertyFilter } from "@/components/PropertyFilter";
import { PropertyImage } from "@/components/PropertyImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  addFavoriteProperty,
  deleteFavoriteProperty,
  fetchAllProperties,
  fetchFavoriteProperties,
} from "@/lib/dataActions";
import { Property } from "@/lib/types";
import { clamp, cn } from "@/lib/utils";
import { BathIcon, BedIcon, HeartIcon, ImageOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import numeral from "numeral";
import { Suspense, useEffect, useRef, useState } from "react";

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const { propertyFilter } = usePropertyFilter();
  const [properties, setProperties] = useState<Property[]>([]);
  const itemsPerPage = 30;
  const [totalPages, setTotalPages] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const { user } = useAuth();
  const router = useRouter();
  const [loadingProperties, setLoadingProperties] = useState(false);
  const loading = loadingProperties;

  const searchParams = useSearchParams();
  const page = clamp(Number(searchParams.get("page")) || 1, 1, totalPages);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    (async () => {
      setLoadingProperties(true);
      try {
        const response = await fetchAllProperties();
        const filteredProperties = response.filter(propertyFilter);

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
        setLoadingProperties(false);
      }
    })();
  }, [propertyFilter]);

  useEffect(() => {
    (async () => {
      if (!user?.userId) {
        setFavoriteIds([]);
        return;
      }

      try {
        const favorites = await fetchFavoriteProperties();
        setFavoriteIds(favorites.map((favorite) => favorite.id));
      } catch (error) {
        console.error(error);
        toast({
          title: "Failed to fetch favorites",
          description: JSON.stringify(error),
          variant: "destructive",
        });
      }
    })();
  }, [user?.userId]);

  const handleIsFavoriteChange = async (
    propertyId: string,
    isFavorite: boolean
  ) => {
    if (!user?.userId) {
      router.push("/auth/login", { scroll: false });
      return;
    }

    try {
      setFavoriteIds((prev) => {
        if (isFavorite) {
          if (!prev.includes(propertyId)) {
            return [...prev, propertyId];
          }
          return prev;
        }
        return prev.filter((id) => id !== propertyId);
      });
      if (isFavorite) {
        await addFavoriteProperty(propertyId);
      } else {
        await deleteFavoriteProperty(propertyId);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update favorites",
        description: JSON.stringify(error),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (containerRef.current && searchParams.get("page")) {
      const yOffset = -100;
      const element = containerRef.current;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset; // TODO: fix this
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <PageLoading loading={loading}>
      <div className="w-4/5 max-w-screen-lg mx-auto py-5">
        <h1 className="text-3xl font-bold mb-5">Property Search</h1>
        <PropertyFilter />

        <div ref={containerRef} className="mt-8 grid grid-cols-3 gap-8">
          {properties.slice(startIndex, endIndex).map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={favoriteIds.includes(property.id)}
              onIsFavoriteChange={(isFavorite) =>
                handleIsFavoriteChange(property.id, isFavorite)
              }
            />
          ))}
        </div>

        <PagePagination className="mt-4" page={page} totalPages={totalPages} />
      </div>
    </PageLoading>
  );
}

function PropertyCard({
  property,
  className,
  isFavorite,
  onIsFavoriteChange,
}: {
  property: Property;
  className?: string;
  isFavorite?: boolean;
  onIsFavoriteChange?: (isFavorite: boolean) => void;
}) {
  return (
    <Card
      className={cn(
        "min-w-40 w-full h-96 overflow-hidden relative p-0",
        className
      )}
    >
      <button
        className="absolute top-0 right-0 z-10 bg-white p-1 rounded-bl-lg cursor-pointer hover:bg-gray-100"
        onClick={() => onIsFavoriteChange?.(!isFavorite)}
      >
        <HeartIcon
          fill={isFavorite ? "red" : "none"}
          className={cn(isFavorite ? "text-red-500" : "text-muted-foreground")}
        />
      </button>
      <CardContent className="w-full h-full p-0 flex flex-col">
        <div className="w-full h-44 relative">
          {(property.images?.length ?? 0) > 0 ? (
            <PropertyImage
              src={property.images?.[0] || ""}
              alt={property.id}
              sizes="lg"
              className="object-cover"
              fill
            />
          ) : (
            <div className="w-full h-full bg-secondary flex flex-col items-center justify-center text-sm font-medium gap-2 text-muted-foreground">
              <ImageOffIcon size={40} />
              <p>No images available</p>
            </div>
          )}
        </div>
        <div className="w-full flex-1 p-4 flex flex-col gap-3 text-sm">
          <p className="tracking-wider flex-1">
            {property.addressLine1}, {property.addressLine2}, {property.city},
            {property.postcode}
          </p>
          <div className="flex flex-row gap-4">
            <div className="flex flex-row items-center gap-1">
              <BedIcon />
              {property.bedrooms}
            </div>
            <div className="flex flex-row items-center gap-1">
              <BathIcon />
              {property.bathrooms}
            </div>
          </div>
          <p className="text-xl font-medium">
            {numeral(property.price).format("$0,0")}
          </p>
          <Button className="uppercase tracking-widest">
            <Link href={`/property/${property.id}`}>View Property</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
