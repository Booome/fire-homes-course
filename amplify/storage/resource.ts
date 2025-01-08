import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "amplifyTeamDrive",
  access: (allow) => ({
    "profile-pictures/{entity_id}/*": [
      allow.guest.to(["read"]),
      allow.entity("identity").to(["read", "write", "delete"]),

      // TODO: don't know why this is needed for a owner who added to the group to read/write/delete
      allow.groups(["admin"]).to(["read", "write", "delete"]),
    ],
    "property-images/*": [
      allow.guest.to(["read"]),
      allow.groups(["admin"]).to(["read", "write", "delete"]),
    ],
  }),
});
