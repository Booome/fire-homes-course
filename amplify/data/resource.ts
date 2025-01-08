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
      images: a.string().required().array(),
      favorites: a.hasMany("FavoriteProperty", "propertyId"),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
      allow.group("admin").to(["create", "read", "update", "delete"]),
    ]),

  User: a
    .model({
      favorites: a.hasMany("FavoriteProperty", "userId"),
    })
    .authorization((allow) => [
      allow.owner().to(["create", "read", "update", "delete"]),
    ]),

  FavoriteProperty: a
    .model({
      userId: a.id().required(),
      user: a.belongsTo("User", "userId"),
      propertyId: a.id().required(),
      property: a.belongsTo("Property", "propertyId"),
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
