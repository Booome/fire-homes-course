"use client";

import { useAuth } from "@/components/AuthProvider";
import { PagePagination } from "@/components/PagePagination";
import { PropertyFilter, usePropertyFilter } from "@/components/PropertyFilter";
import { PropertyImage } from "@/components/PropertyImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { cardClasses } from "@/lib/consts";
import { Property } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BathIcon, BedIcon, HeartIcon, ImageOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import numeral from "numeral";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const { propertyFilter } = usePropertyFilter();
  const [properties, setProperties] = useState<Property[]>([]);
  const itemsPerPage = 30;
  const [totalPages, setTotalPages] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [favoritesDbId, setFavoritesDbId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user, dbClient } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  useEffect(() => {
    const fetchProperties = async () => {
      if (!dbClient) {
        return;
      }

      console.info("fetching properties");
      const response = await dbClient?.models.Property.list();

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

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!dbClient || !user?.userId) {
        return;
      }

      console.info("fetching favorites");
      const response = await dbClient?.models.Favorites.list({
        filter: {
          owner: {
            eq: `${user?.userId}::${user?.userId}`,
          },
        },
      });

      if (response?.data.length == 1) {
        setFavoritesDbId(response?.data[0]?.id as string);
        setFavorites(response?.data[0]?.propertyIds as string[]);
        return;
      }

      console.error("Unhandled favorites response:", response);
      toast({
        title: "Unhandled favorites response",
        description: JSON.stringify(response),
      });
    };
    fetchFavorites();
  }, [dbClient, user?.userId]);

  const handleIsFavoriteChange = async (
    propertyId: string,
    isFavorite: boolean
  ) => {
    let newFavorites = [...favorites];
    let response;

    if (!dbClient || !user?.userId) {
      router.push("/auth/login", { scroll: false });
      return;
    }

    if (isFavorite) {
      if (!favorites.includes(propertyId)) {
        newFavorites.push(propertyId);
      }
    } else {
      newFavorites = favorites.filter((id) => id !== propertyId);
    }
    setFavorites(newFavorites);

    if (!favoritesDbId) {
      response = await dbClient?.models.Favorites.create({
        propertyIds: newFavorites,
      });
      setFavoritesDbId(response?.data?.id as string);
    } else {
      response = await dbClient?.models.Favorites.update({
        id: favoritesDbId,
        propertyIds: newFavorites,
      });
    }

    if (response?.data?.propertyIds) {
      setFavorites(response?.data?.propertyIds as string[]);
    }
  };

  useEffect(() => {
    if (containerRef.current && searchParams.get("page")) {
      const yOffset = -100;
      const element = containerRef.current;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="w-4/5 max-w-screen-lg mx-auto py-5">
      <h1 className="text-3xl font-bold mb-5">Property Search</h1>
      <PropertyFilter />

      <div ref={containerRef} className="mt-8 grid grid-cols-3 gap-8">
        {properties.slice(startIndex, endIndex).map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorite={favorites.includes(property.id)}
            onIsFavoriteChange={(isFavorite) =>
              handleIsFavoriteChange(property.id, isFavorite)
            }
          />
        ))}
      </div>

      <PagePagination className="mt-4" page={page} totalPages={totalPages} />
    </div>
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
        "min-w-40 w-full h-96 overflow-hidden relative",
        cardClasses,
        className
      )}
    >
      <div
        className="absolute top-0 right-0 z-10 bg-white p-1 rounded-bl-lg cursor-pointer"
        onClick={() => onIsFavoriteChange?.(!isFavorite)}
      >
        <HeartIcon
          fill={isFavorite ? "red" : "none"}
          className={cn(isFavorite ? "text-red-500" : "text-muted-foreground")}
        />
      </div>
      <CardContent className="w-full h-full p-0 flex flex-col">
        <div className="w-full h-44 relative">
          {property.images.length > 0 ? (
            <PropertyImage
              src={property.images[0]}
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