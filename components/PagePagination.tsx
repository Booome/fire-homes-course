import { toast } from "@/hooks/use-toast";
import { clamp, cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Input } from "./ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

export function PagePagination({
  className,
  page,
  totalPages,
  siblingCount = 2,
}: {
  className?: string;
  page: number;
  totalPages: number;
  siblingCount?: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = page.toString();
    }
  }, [page]);

  const getPageUrl = (page: number) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    page = clamp(page, 1, totalPages);
    urlSearchParams.set("page", page.toString());
    return `?${urlSearchParams.toString()}`;
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = Number(e.currentTarget.value);
      if (page > 0 && page <= totalPages) {
        router.push(getPageUrl(page), { scroll: false });
      } else {
        toast({
          title: "Invalid page number",
          description: "Please enter a valid page number",
        });
      }
    }
  };

  const numberList = [];
  numberList.push(1);
  if (page - siblingCount > 2) {
    numberList.push("...");
  }
  for (
    let i = Math.max(2, page - siblingCount);
    i <= Math.min(totalPages - 1, page + siblingCount);
    i++
  ) {
    numberList.push(i);
  }
  if (page + siblingCount < totalPages - 1) {
    numberList.push("...");
  }
  if (totalPages > 1) {
    numberList.push(totalPages);
  }

  return (
    <Pagination className={cn("mt-2", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={getPageUrl(page - 1)} scroll={false} />
        </PaginationItem>

        {numberList.map((item, index) => (
          <PaginationItem key={index}>
            {item === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={getPageUrl(item as number)} scroll={false}>
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext href={getPageUrl(page + 1)} scroll={false} />
        </PaginationItem>

        <PaginationItem className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="number"
            onKeyDown={handleInputKeyDown}
            className="w-24"
          />
          <span className="text-muted-foreground">{"/ " + totalPages}</span>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
