import outputs from "@/amplify_outputs.json";
import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { AmplifyServer } from "aws-amplify/adapter-core";
import { cookies } from "next/headers";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export async function runWithCookiesContext<T>(
  operation: (contextSpec: AmplifyServer.ContextSpec) => Promise<T>
): Promise<T> {
  return runWithAmplifyServerContext({
    nextServerContext: {
      cookies,
    },
    operation,
  });
}
