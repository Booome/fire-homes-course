import { toast } from "@/hooks/use-toast";

export function unhandledErrorToast(error: unknown) {
  console.error(error);
  toast({
    title: "Unhandled Error",
    description: error instanceof Error ? error.message : JSON.stringify(error),
    variant: "destructive",
  });
}

export function unhandledResponseToast(response: unknown) {
  console.log(response);
  toast({
    title: "Unhandled Response",
    description: JSON.stringify(response),
    variant: "destructive",
  });
}
