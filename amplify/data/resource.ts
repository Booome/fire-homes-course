import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Property: a
    .model({
      status: a.string().required(),
      addressLine1: a.string().required(),
      addressLine2: a.string(),
      price: a.float().required(),
      city: a.string().required(),
      postcode: a.string().required(),
      bedrooms: a.integer().required(),
      bathrooms: a.integer().required(),
      description: a.string().required(),
      images: a.json().required(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
      allow.group("admin").to(["create", "read", "update", "delete"]),
    ]),

  Favorites: a
    .model({
      propertyIds: a.string().array(),
    })
    .authorization((allow) => [
      allow.owner().to(["create", "read", "update", "delete"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
