import { Schema } from "@/amplify/data/resource";

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

export type Property = Schema["Property"]["type"];
export type PropertyCreate = Schema["Property"]["createType"];
export type PropertyUpdate = Schema["Property"]["updateType"];
