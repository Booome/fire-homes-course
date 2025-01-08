import { Badge } from "@/components/ui/badge";
import { PropertyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { capitalCase } from "change-case";

export function PropertyStatusBadge({
  status,
  className,
}: {
  status: PropertyStatus;
  className?: string;
}) {
  const variant: Record<PropertyStatus, string> = {
    draft: "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200",
    "for-sale":
      "bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200",
    withdrawn: "bg-red-100 text-red-800 border border-red-300 hover:bg-red-200",
    sold: "bg-green-100 text-green-800 border border-green-300 hover:bg-green-200",
  };

  return (
    <Badge className={cn(variant[status], className)}>
      {capitalCase(status)}
    </Badge>
  );
}
