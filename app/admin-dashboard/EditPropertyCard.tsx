import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MultiPictureSelector } from "@/components/MultiPictureSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formItemClasses } from "@/lib/consts";
import {
  createProperty,
  deleteProperty,
  updateProperty,
} from "@/lib/dataActions";
import { Property, PropertyStatus, PropertyStatusList } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { list, remove, uploadData } from "aws-amplify/storage";
import { capitalCase } from "change-case";
import { PlusCircleIcon, SaveIcon, TrashIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const formSchema = z.object({
  status: z.enum(PropertyStatusList),
  addressLine1: z.string().min(1),
  addressLine2: z.string().min(1),
  city: z.string().min(1),
  postcode: z.string().min(5),
  price: z.number().min(0),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  description: z.string().min(10),
  images: z.array(z.string()).min(1),
});

export function NewPropertyCard() {
  return <PropertyCardImpl title="New property" />;
}

export function EditPropertyCard({ property }: { property: Property }) {
  return <PropertyCardImpl title="Edit property" property={property} />;
}

function getImageStoragePath(propertyId: string, image?: string) {
  return `property-images/${propertyId}/${image}`;
}

async function uploadImage(propertyId: string, image: string) {
  const response = await fetch(image);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const fileExtension = blob.type.split("/")[1] || "jpg";
  const randomFileName = `${crypto.randomUUID()}.${fileExtension}`;

  const result = await uploadData({
    path: getImageStoragePath(propertyId, randomFileName),
    data: arrayBuffer,
  }).result;

  return result.path;
}

async function uploadImages(propertyId: string, images: string[]) {
  const uploadedImages: string[] = [];

  try {
    await Promise.all(
      images.map(async (image) => {
        uploadedImages.push(await uploadImage(propertyId, image));
      })
    );
  } catch (error) {
    await deleteImages(uploadedImages);
    throw error;
  }

  return uploadedImages;
}

async function preprocessImages(propertyId: string, images: string[]) {
  const result: string[] = new Array(images.length).fill("");
  const uploadedImages: string[] = [];

  try {
    await Promise.all(
      images.map(async (image, index) => {
        if (image.startsWith("blob")) {
          const uploadedImage = await uploadImage(propertyId, image);
          uploadedImages.push(uploadedImage);
          result[index] = uploadedImage;
        } else {
          result[index] = image;
        }
      })
    );
  } catch (error) {
    await deleteImages(uploadedImages);
    throw error;
  }

  return { images: result, uploadedImages };
}

async function cleanPropertyImages(propertyId: string, images: string[] = []) {
  const listResult = await list({ path: getImageStoragePath(propertyId) });
  const allImages = listResult.items.map((item) => item.path);
  const imagesToDelete = allImages.filter((image) => !images.includes(image));

  await deleteImages(imagesToDelete);
}

async function deleteImages(images: string[]) {
  await Promise.allSettled(
    images.map(async (image) => {
      await remove({ path: image });
    })
  );
}

function PropertyCardImpl({
  title,
  property,
}: {
  title: string;
  property?: Property;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const mainButtonClasses = "w-1/2 mx-auto uppercase tracking-widest text-lg";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: (property?.status as PropertyStatus) || "draft",
      price: property?.price || 0,
      addressLine1: property?.addressLine1 || "",
      addressLine2: property?.addressLine2 || "",
      bedrooms: property?.bedrooms || 0,
      bathrooms: property?.bathrooms || 0,
      city: property?.city || "",
      description: property?.description || "",
      postcode: property?.postcode || "",
      images: property?.images || [],
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleNewProperty = async (values: z.infer<typeof formSchema>) => {
    let uploadedImages: string[] = [];

    try {
      let response = await createProperty({
        status: values.status,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        city: values.city,
        postcode: values.postcode,
        price: values.price,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        description: values.description,
        images: [],
      });
      if (!response) {
        throw new Error(
          `Failed to create property: ${JSON.stringify(response)}`
        );
      }
      const propertyId = response.id;
      uploadedImages = await uploadImages(propertyId, values.images);

      response = await updateProperty({
        id: propertyId,
        images: uploadedImages,
      });
      if (!response) {
        throw new Error(
          `Failed to update property: ${JSON.stringify(response)}`
        );
      }

      await cleanPropertyImages(propertyId, uploadedImages);

      toast({
        title: "Property created successfully",
      });
      router.replace(`/admin-dashboard/`);
    } catch (error) {
      deleteImages(uploadedImages);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to create property";
      console.error(errorMessage);
      toast({
        title: "Failed to create property",
        description: errorMessage,
      });
    }
  };

  const handleEditProperty = async (values: z.infer<typeof formSchema>) => {
    let uploadedImages: string[] = [];

    try {
      const images = await preprocessImages(property!.id, values.images);
      uploadedImages = images.uploadedImages;

      const response = await updateProperty({
        id: property!.id,
        status: values.status,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        price: values.price,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        city: values.city,
        postcode: values.postcode,
        description: values.description,
        images: images.images,
      });
      if (!response) {
        throw new Error("Failed to update property");
      }

      await cleanPropertyImages(property!.id, images.images);
      revalidatePath(`/property/${property!.id}`);

      toast({
        title: "Property updated successfully",
      });
      router.replace(`/admin-dashboard/`);
    } catch (error) {
      deleteImages(uploadedImages);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to update property";
      console.error(errorMessage);
      toast({
        title: "Failed to update property",
        description: errorMessage,
      });
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      if (property) {
        await handleEditProperty(values);
      } else {
        await handleNewProperty(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async () => {
    try {
      setIsSubmitting(true);

      await cleanPropertyImages(property!.id);
      await deleteProperty(property!.id);

      toast({
        title: "Property deleted successfully",
      });
      router.replace(`/admin-dashboard/`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to delete property",
        description: JSON.stringify(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormSelectField
                form={form}
                name="status"
                options={PropertyStatusList}
              />
              <FormNumberField form={form} name="price" />
              <FormStringField form={form} name="addressLine1" />
              <FormNumberField form={form} name="bedrooms" />
              <FormStringField form={form} name="addressLine2" />
              <FormNumberField form={form} name="bathrooms" />
              <FormStringField form={form} name="city" />
              <FormTextareaField form={form} name="description" />
              <FormStringField form={form} name="postcode" />
              <FormImagesField form={form} name="images" />

              <div className="col-span-2 w-1/2 mx-auto flex gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  className={mainButtonClasses}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {property ? <SaveIcon /> : <PlusCircleIcon />}
                  Submit
                </Button>

                {property && (
                  <Button
                    variant="destructive"
                    size="lg"
                    className={mainButtonClasses}
                    disabled={isSubmitting}
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <TrashIcon />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Are you sure you want to delete this property?"
        onConfirm={handleDeleteProperty}
      />
    </Card>
  );
}

function FormSelectField({
  form,
  name,
  options,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  name: string;
  options: readonly string[];
}) {
  return (
    <FormField
      control={form.control}
      name={name as keyof z.infer<typeof formSchema>}
      render={({ field }) => (
        <FormItem className={formItemClasses}>
          <FormLabel>{capitalCase(name)}</FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value as string}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {capitalCase(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FormNumberField({
  form,
  name,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  name: string;
}) {
  const handleNumberChange = (field: FieldValues, value: string) => {
    field.onChange(value === "" ? "" : Number(value));
  };

  return (
    <FormField
      control={form.control}
      name={name as keyof z.infer<typeof formSchema>}
      render={({ field }) => (
        <FormItem className={formItemClasses}>
          <FormLabel>{capitalCase(name)}</FormLabel>
          <FormControl>
            <Input
              type="number"
              {...field}
              value={field.value as number}
              onChange={(e) =>
                handleNumberChange(field, e.target.value as string)
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FormStringField({
  form,
  name,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  name: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name as keyof z.infer<typeof formSchema>}
      render={({ field }) => (
        <FormItem className={formItemClasses}>
          <FormLabel>{capitalCase(name)}</FormLabel>
          <FormControl>
            <Input type="text" {...field} value={field.value as string} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FormTextareaField({
  form,
  name,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  name: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name as keyof z.infer<typeof formSchema>}
      render={({ field }) => (
        <FormItem className={cn(formItemClasses, "row-span-2 flex flex-col")}>
          <FormLabel>{capitalCase(name)}</FormLabel>
          <FormControl className="flex-1">
            <Textarea {...field} value={field.value as string} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FormImagesField({
  form,
  name,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  name: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name as keyof z.infer<typeof formSchema>}
      render={({ field }) => (
        <FormItem className={cn(formItemClasses, "col-span-2 w-full my-5")}>
          <FormLabel>Images</FormLabel>
          <FormControl className="p-5 rounded-lg shadow">
            <MultiPictureSelector
              value={field.value as string[]}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
