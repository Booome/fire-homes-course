import { AuthSession } from "aws-amplify/auth";

export function getGroups(session?: AuthSession) {
  return (
    (session?.tokens?.accessToken?.payload["cognito:groups"] as string[]) || []
  );
}

export function isAdmin(session: AuthSession) {
  return getGroups(session).includes("admin");
}
