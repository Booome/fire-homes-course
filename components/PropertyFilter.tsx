import {
  bathroomList,
  bedroomList,
  Property,
  PropertyStatus,
  PropertyStatusList,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { capitalCase } from "change-case";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useCallback, useId, useMemo } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { PropertyStatusBadge } from "./PropertyStatusBadge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const filterFieldClasses = "space-y-0 flex flex-row text-base items-center";
const filterFieldNameClasses = "font-medium min-w-28";
const filterFieldOptionClasses = "flex items-center space-x-1 min-w-28";
const filterFieldOptionLabelClasses = "font-normal";

const formSchema = z
  .object({
    status: z.array(z.enum(PropertyStatusList)),
    price: z.tuple([z.string(), z.string()]),
    bedrooms: z.array(z.enum(bedroomList)),
    bathrooms: z.array(z.enum(bathroomList)),
  })
  .refine(
    (data) => {
      if (!data.price[0] || !data.price[1]) return true;
      return Number(data.price[1]) >= Number(data.price[0]);
    },
    {
      message: "Maximum price must be greater than minimum price",
      path: ["price"],
    }
  );

export function PropertyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: JSON.parse(searchParams.get("status") ?? "[]"),
      price: [
        searchParams.get("minPrice") ?? "",
        searchParams.get("maxPrice") ?? "",
      ],
      bedrooms: JSON.parse(searchParams.get("bedrooms") ?? "[]"),
      bathrooms: JSON.parse(searchParams.get("bathrooms") ?? "[]"),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const searchParams = new URLSearchParams();
    if (values.status.length > 0) {
      searchParams.set("status", JSON.stringify(values.status));
    }
    if (values.bedrooms.length > 0) {
      searchParams.set("bedrooms", JSON.stringify(values.bedrooms));
    }
    if (values.bathrooms.length > 0) {
      searchParams.set("bathrooms", JSON.stringify(values.bathrooms));
    }
    if (values.price[0]) {
      searchParams.set("minPrice", values.price[0]);
    }
    if (values.price[1]) {
      searchParams.set("maxPrice", values.price[1]);
    }
    router.push(`?${searchParams.toString()}`, { scroll: false });
  };

  return (
    <Card className="p-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 flex flex-col gap-4"
        >
          <FormCheckboxField
            form={form}
            name="status"
            options={PropertyStatusList}
            optionRenderer={(option) => (
              <PropertyStatusBadge status={option as PropertyStatus} />
            )}
          />
          <FormCheckboxField
            form={form}
            name="bedrooms"
            options={bedroomList}
          />
          <FormCheckboxField
            form={form}
            name="bathrooms"
            options={bathroomList}
          />
          <FormNumberRangeField
            form={form}
            name="price"
            inputClassName="w-40"
          />

          <div className="flex flex-row gap-2">
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              className="uppercase tracking-widest mt-2 w-24"
            >
              Filter
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="uppercase tracking-widest mt-2 w-24"
              onClick={() => {
                form.reset();
                router.push("?", { scroll: false });
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

function FormCheckboxField({
  form,
  name,
  options,
  optionRenderer,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  name: keyof z.infer<typeof formSchema>;
  options: readonly string[];
  optionRenderer?: (option: string) => React.ReactNode;
}) {
  const checkboxId = useId();

  return (
    <FormField
      control={form.control}
      name={name}
      render={(field) => (
        <FormItem className={filterFieldClasses}>
          <FormLabel className={filterFieldNameClasses}>
            {capitalCase(name)}:
          </FormLabel>
          <FormControl>
            <div className="flex flex-row items-center">
              {options.map((option) => (
                <div key={option} className={filterFieldOptionClasses}>
                  <Checkbox
                    id={`${checkboxId}-${option}`}
                    checked={((field.field.value ?? []) as string[]).includes(
                      option
                    )}
                    onCheckedChange={(checked) => {
                      field.field.onChange(
                        checked
                          ? [...(field.field.value as string[]), option]
                          : (field.field.value as string[]).filter(
                              (value) => value !== option
                            )
                      );
                    }}
                  />
                  <Label
                    htmlFor={`${checkboxId}-${option}`}
                    className={filterFieldOptionLabelClasses}
                  >
                    {optionRenderer ? optionRenderer(option) : option}
                  </Label>
                </div>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FormNumberRangeField({
  form,
  name,
  className,
  inputClassName,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  name: string;
  className?: string;
  inputClassName?: string;
}) {
  const handleChange = (
    field: FieldValues,
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = [...(field.field.value as string[])];
    newValue[index] = event.target.value;
    field.field.onChange(newValue);
  };

  return (
    <div className={cn("flex flex-row items-center", className)}>
      <FormField
        control={form.control}
        name={name as keyof z.infer<typeof formSchema>}
        render={(field) => (
          <FormItem>
            <div className="flex flex-row items-center">
              <FormLabel className={cn(filterFieldNameClasses)}>
                {capitalCase(name)}:
              </FormLabel>
              <FormControl>
                <div className="flex flex-row items-center gap-2">
                  <Input
                    className={inputClassName}
                    type="number"
                    value={field.field.value[0]}
                    onChange={(e) => handleChange(field, 0, e)}
                  />
                  <span>&nbsp;-&nbsp;</span>
                  <Input
                    className={inputClassName}
                    type="number"
                    value={field.field.value[1]}
                    onChange={(e) => handleChange(field, 1, e)}
                  />
                </div>
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function usePropertyFilter() {
  const searchParams = useSearchParams();

  const statusFilter = JSON.parse(searchParams.get("status") ?? "[]").sort();
  const statusFilterString = JSON.stringify(statusFilter);

  const bedroomsFilter = JSON.parse(
    searchParams.get("bedrooms") ?? "[]"
  ).sort();
  const bedroomsFilterString = JSON.stringify(bedroomsFilter);

  const bathroomsFilter = useMemo(
    () => JSON.parse(searchParams.get("bathrooms") ?? "[]").sort(),
    [searchParams]
  );
  const bathroomsFilterString = JSON.stringify(bathroomsFilter);

  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;

  const propertyFilter = useCallback(
    (property: Property) => {
      if (statusFilter.length > 0 && !statusFilter.includes(property.status)) {
        return false;
      }
      if (bedroomsFilter.length > 0) {
        const bedroomIndex = Math.min(
          property.bedrooms ?? 0,
          bedroomList.length - 1
        );
        if (!bedroomsFilter.includes(bedroomList[bedroomIndex])) {
          return false;
        }
      }
      if (bathroomsFilter.length > 0) {
        const bathroomIndex = Math.min(
          property.bathrooms ?? 0,
          bathroomList.length - 1
        );
        if (!bathroomsFilter.includes(bathroomList[bathroomIndex])) {
          return false;
        }
      }
      if (minPrice !== undefined && property.price < minPrice) {
        return false;
      }
      if (maxPrice !== undefined && property.price > maxPrice) {
        return false;
      }

      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      statusFilterString,
      bedroomsFilterString,
      bathroomsFilterString,
      minPrice,
      maxPrice,
    ]
  );

  return { propertyFilter };
}
