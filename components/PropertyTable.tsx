import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Property, PropertyStatus } from "@/lib/types";
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import numeral from "numeral";
import { PropertyStatusBadge } from "./PropertyStatusBadge";

type ActionType = "view" | "edit" | "delete";

type Props = {
  properties: Property[];
  actionTypes?: ActionType[];
  onDelete?: (id: string) => void;
};

export function PropertyTable({
  properties,
  actionTypes = ["view", "delete"],
  onDelete = () => {},
}: Props) {
  return (
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
        {properties.map((property) => {
          const address = `${property.addressLine1}, ${property.addressLine2}, ${property.city}, ${property.postcode}`;

          return (
            <TableRow key={property.id}>
              <TableCell>{address}</TableCell>
              <TableCell className="text-center">{property.bedrooms}</TableCell>
              <TableCell className="text-center">
                {property.bathrooms}
              </TableCell>
              <TableCell className="text-right">
                {numeral(property.price).format("$0,0")}
              </TableCell>
              <TableCell className="text-center">
                <PropertyStatusBadge
                  status={property.status as PropertyStatus}
                />
              </TableCell>
              <TableCell className="text-center flex gap-2">
                {actionTypes.includes("view") && (
                  <Link href={`/property/${property.id}`} title="View">
                    <EyeIcon className="shadow p-1 rounded-md" />
                  </Link>
                )}
                {actionTypes.includes("edit") && (
                  <Link
                    href={`/admin-dashboard/${property.id}/edit`}
                    title="Edit"
                  >
                    <PencilIcon className="shadow p-1 rounded-md" />
                  </Link>
                )}
                {actionTypes.includes("delete") && (
                  <button onClick={() => onDelete(property.id)} title="Delete">
                    <TrashIcon className="shadow p-1 rounded-md" />
                  </button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
