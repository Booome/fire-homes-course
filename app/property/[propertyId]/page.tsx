"use client";

import { PropertyImage } from "@/components/PropertyImage";
import { PropertyStatusBadge } from "@/components/PropertyStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { fetchProperty } from "@/lib/dataActions";
import { Property, PropertyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowLeftIcon,
  BathIcon,
  BedIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import numeral from "numeral";
import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

export default function Page({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setProperty(await fetchProperty(propertyId));
      } catch (error) {
        console.error(error);
        toast({
          title: "Failed to fetch property",
          description: JSON.stringify(error),
          variant: "destructive",
        });
      }
    })();
  }, [propertyId, toast]);

  return (
    <div className="flex flex-row">
      {property && (
        <>
          <PageBodyLeft property={property} />
          <PageBodyRight property={property} />
        </>
      )}
    </div>
  );
}

function PageBodyLeft({ property }: { property: Property }) {
  const router = useRouter();

  const markdownClassName = cn(
    "[&_h1]:text-5xl [&_h1]:font-bold [&_h1]:my-4",
    "[&_h2]:text-4xl [&_h2]:font-bold [&_h2]:my-4",
    "[&_h3]:text-3xl [&_h3]:font-bold [&_h3]:my-4",
    "[&_h4]:text-2xl [&_h4]:font-bold [&_h4]:my-4",
    "[&_h5]:text-xl [&_h5]:font-bold [&_h5]:my-4",
    "[&_h6]:text-lg [&_h6]:font-bold [&_h6]:my-4",
    "[&_p]:my-4",
    "[&_ul]:list-disc [&_ul]:my-4 [&_ul]:ml-8"
  );

  return (
    <div className="flex-1">
      <PageCarousel property={property} />

      <div className="w-4/5 max-w-screen-lg mx-auto py-10">
        <Button
          variant="outline"
          className="mb-4 px-0 border-none shadow-none hover:bg-background hover:underline"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon />
          Back to properties
        </Button>
        <ReactMarkdown className={markdownClassName}>
          {property?.description || ""}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function PageCarousel({ property }: { property: Property }) {
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowArrow(false);
      } else {
        setShowArrow(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="group relative"
      >
        <CarouselContent>
          {property.images?.map((image) => (
            <CarouselItem key={image}>
              <div className="relative h-body">
                <PropertyImage
                  src={image}
                  alt="Property Image"
                  fill
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {(property.images?.length ?? 0) > 1 && (
          <>
            <CarouselPrevious className="translate-x-24 opacity-0 group-hover:opacity-100 shadow border-none size-12" />
            <CarouselNext className="-translate-x-24 opacity-0 group-hover:opacity-100 shadow border-none size-12" />
          </>
        )}
      </Carousel>

      {(property.images?.length ?? 0) > 0 && showArrow && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-1 animate-bounce">
            <ChevronDownIcon size={60} className="text-white/80" />
            <ChevronDownIcon size={60} className="-mt-20 text-white/60" />
            <ChevronDownIcon size={60} className="-mt-20 text-white/40" />
          </div>
        </div>
      )}
    </div>
  );
}

function PageBodyRight({ property }: { property: Property }) {
  return (
    <div className="w-1/4 min-w-96 bg-secondary h-screen sticky top-0 flex flex-col justify-center items-start gap-8 px-14">
      <PropertyStatusBadge status={property.status as PropertyStatus} />

      <div className="font-bold text-3xl flex flex-col gap-1">
        <p>{property.addressLine1},</p>
        <p>{property.addressLine2},</p>
        <p>{property.city},</p>
        <p>{property.postcode}</p>
      </div>

      <p className="text-2xl">{numeral(property.price).format("$0,0")}</p>

      <div className="flex flex-row gap-8">
        <p className="flex flex-row gap-1 items-center">
          <BedIcon />
          {property.bedrooms} Bedrooms
        </p>
        <p className="flex flex-row gap-1 items-center">
          <BathIcon />
          {property.bathrooms} Bathrooms
        </p>
      </div>
    </div>
  );
}
