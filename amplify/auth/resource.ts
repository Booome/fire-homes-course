import { defineAuth, secret } from "@aws-amplify/backend";

const callbackUrls = process.env.CALLBACK_URLS?.split(",") || [];
const logoutUrls = process.env.LOGOUT_URLS?.split(",") || [];

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
        attributeMapping: {
          email: "email",
          fullname: "name",
          profilePicture: "picture",
        },
        scopes: ["email", "profile"],
      },
      callbackUrls,
      logoutUrls,
    },
  },
  groups: ["admin"],
});
