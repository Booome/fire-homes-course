import { remove } from "aws-amplify/storage";

export async function deleteProfilePicture() {
  await remove({
    path: ({ identityId }) => `profile-pictures/${identityId}/*`,
  });
}
