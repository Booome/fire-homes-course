export const PropertyStatusList = [
  "draft",
  "for-sale",
  "withdrawn",
  "sold",
] as const;
export type PropertyStatus = (typeof PropertyStatusList)[number];

export const bedroomList = ["0", "1", "2", "3", ">3"] as const;
export type Bedroom = (typeof bedroomList)[number];

export const bathroomList = ["0", "1", "2", "3", ">3"] as const;
export type Bathroom = (typeof bathroomList)[number];

export type Property = {
  id: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  description: string;
  images: string[];
};

// export type Property = Schema["Property"]["type"];
