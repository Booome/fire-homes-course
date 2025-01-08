import { Loader2 } from "lucide-react";

export function PageLoading({
  children,
  loading,
}: {
  children?: React.ReactNode;
  loading: boolean;
}) {
  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-white/70 z-50">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {children}
    </>
  );
}
